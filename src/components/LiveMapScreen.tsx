import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation2, Wallet, Loader2, Locate, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import LockedOverlay from './LockedOverlay';
import { canAccess } from '@/lib/entitlements';
import type { TripPlan } from '@/types/trip';

interface Props {
  plan: TripPlan;
  userPlan: string;
  onUpgrade: () => void;
}

const GOOGLE_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

// Global loader — one script tag for entire app
let mapsLoaderPromise: Promise<typeof google> | null = null;
function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);
  if (mapsLoaderPromise) return mapsLoaderPromise;
  if (!GOOGLE_KEY) return Promise.reject(new Error('Google Maps key missing'));

  mapsLoaderPromise = new Promise((resolve, reject) => {
    (window as any).__initGoogleMaps = () => resolve((window as any).google);
    const s = document.createElement('script');
    const params = new URLSearchParams({
      key: GOOGLE_KEY,
      loading: 'async',
      callback: '__initGoogleMaps',
      libraries: 'geometry',
    });
    if (TRACKING_ID) params.set('channel', TRACKING_ID);
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(s);
  });
  return mapsLoaderPromise;
}

interface Coord { lat: number; lng: number; name: string }

function LiveMap({ places, destinationName }: { places: string[]; destinationName: string }) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(false);
  const [coords, setCoords] = useState<Coord[]>([]);

  // Load map + geocode places
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const google = await loadGoogleMaps();
        if (cancelled || !mapDivRef.current) return;

        // Geocode destination first for centre
        const geocoder = new google.maps.Geocoder();
        const geocode = (q: string) =>
          new Promise<google.maps.LatLng | null>((resolve) => {
            geocoder.geocode({ address: q }, (res, s) => {
              if (s === 'OK' && res?.[0]) resolve(res[0].geometry.location);
              else resolve(null);
            });
          });

        const centerLoc = await geocode(destinationName);
        const map = new google.maps.Map(mapDivRef.current, {
          center: centerLoc ?? { lat: 20, lng: 0 },
          zoom: centerLoc ? 12 : 3,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
          ],
        });
        mapRef.current = map;

        // Geocode places sequentially (small N)
        const bounds = new google.maps.LatLngBounds();
        if (centerLoc) bounds.extend(centerLoc);
        const collected: Coord[] = [];
        const path: google.maps.LatLng[] = [];

        for (let i = 0; i < places.length; i++) {
          const query = `${places[i]}, ${destinationName}`;
          // eslint-disable-next-line no-await-in-loop
          const loc = await geocode(query);
          if (!loc || cancelled) continue;
          bounds.extend(loc);
          path.push(loc);
          collected.push({ lat: loc.lat(), lng: loc.lng(), name: places[i] });

          new google.maps.Marker({
            position: loc,
            map,
            label: { text: String(i + 1), color: 'white', fontWeight: '700', fontSize: '12px' },
            title: places[i],
          });
        }

        if (path.length > 1) {
          new google.maps.Polyline({
            path,
            map,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.85,
            strokeWeight: 3,
            icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '15px' }],
          });
        }

        if (!bounds.isEmpty()) map.fitBounds(bounds, 60);
        setCoords(collected);
        setStatus('ready');
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to load map');
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [places.join('|'), destinationName]);

  const toggleTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    if (tracking) {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
      setTracking(false);
      return;
    }
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const google = (window as any).google;
        if (!google || !mapRef.current) return;
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!userMarkerRef.current) {
          userMarkerRef.current = new google.maps.Marker({
            position: p,
            map: mapRef.current,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#22c55e',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            title: 'You are here',
            zIndex: 999,
          });
          mapRef.current.panTo(p);
        } else {
          userMarkerRef.current.setPosition(p);
        }
      },
      (err) => {
        setError(err.message);
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  };

  if (!GOOGLE_KEY) {
    return (
      <div className="w-full h-[420px] rounded-2xl bg-secondary border border-border flex items-center justify-center text-sm text-muted-foreground">
        <AlertCircle className="w-4 h-4 mr-2" /> Maps unavailable — connect Google Maps.
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapDivRef} className="w-full h-[420px] rounded-2xl overflow-hidden border border-border shadow-lg" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl text-sm text-destructive">
          {error}
        </div>
      )}
      {status === 'ready' && (
        <>
          <Button
            onClick={toggleTracking}
            size="sm"
            className={`absolute top-3 right-3 gap-1.5 rounded-full shadow-lg ${
              tracking ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary'
            }`}
          >
            <Locate className={`w-4 h-4 ${tracking ? 'animate-pulse' : ''}`} />
            {tracking ? 'Stop tracking' : 'Track me'}
          </Button>
          <div className="absolute bottom-3 left-3 glass-strong rounded-xl px-3 py-2 text-xs flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>{coords.length} of {places.length} places plotted</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function LiveMapScreen({ plan, userPlan, onUpgrade }: Props) {
  const allowed = canAccess(userPlan, 'liveMap');
  const [selectedDay, setSelectedDay] = useState(1);

  const today = plan.days.find((d) => d.day === selectedDay) ?? plan.days[0];
  const spent = today?.cost.total ? Math.round(today.cost.total * 0.62) : 0;
  const dayBudget = today?.cost.total || 1;
  const pct = Math.min(100, Math.round((spent / dayBudget) * 100));

  const places = (today?.places || [])
    .filter((p) => p.category !== 'flight' && p.category !== 'rest')
    .map((p) => p.name);

  const map = (
    <LiveMap places={places} destinationName={plan.setup.destination} />
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Live Map & Tracking</h2>
        <p className="text-sm text-muted-foreground">
          Route through the day's stops. Tap <strong>Track me</strong> to follow your location live.
        </p>
      </div>

      {/* Day switcher */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {plan.days.map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedDay === d.day
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      {allowed ? map : (
        <LockedOverlay feature="liveMap" onUnlock={onUpgrade}>
          {map}
        </LockedOverlay>
      )}

      <div className="glass-strong rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Day {selectedDay} spend estimate</span>
          </div>
          <span className="text-sm">
            {plan.setup.homeCurrency}{spent.toLocaleString()} / {plan.setup.homeCurrency}{dayBudget.toLocaleString()}
          </span>
        </div>
        <Progress value={pct} />
        {!allowed && (
          <p className="text-xs text-muted-foreground mt-3">
            <Navigation2 className="w-3 h-3 inline mr-1" />
            Live GPS tracking updates every few seconds on Premium. Upgrade to unlock.
          </p>
        )}
      </div>
    </div>
  );
}
