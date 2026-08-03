/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation2, Wallet, Loader2, Locate, AlertCircle, ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';
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

type GeoState =
  | { kind: 'idle' }
  | { kind: 'prompting' }
  | { kind: 'tracking' }
  | { kind: 'denied' }
  | { kind: 'unavailable'; message: string };

const geoMessage = (err: GeolocationPositionError): GeoState => {
  if (err.code === err.PERMISSION_DENIED) return { kind: 'denied' };
  if (err.code === err.TIMEOUT)
    return { kind: 'unavailable', message: "Couldn't get a GPS fix in time. Move somewhere with a clearer sky view and try again." };
  return { kind: 'unavailable', message: 'Your location is unavailable right now. You can still follow the route markers below.' };
};

function LiveMap({ places, destinationName }: { places: string[]; destinationName: string }) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const accuracyRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [geo, setGeo] = useState<GeoState>({ kind: 'idle' });
  const [coords, setCoords] = useState<Coord[]>([]);
  const [attempt, setAttempt] = useState(0);

  const routeUrl = places.length
    ? `https://www.google.com/maps/dir/${places
        .map((p) => encodeURIComponent(`${p}, ${destinationName}`))
        .join('/')}`
    : `https://www.google.com/maps/search/${encodeURIComponent(destinationName)}`;

  // Load map + geocode places
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

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
          gestureHandling: 'greedy',
          zoomControl: true,
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
  }, [places.join('|'), destinationName, attempt]);

  const stopTracking = () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    userMarkerRef.current?.setMap(null);
    userMarkerRef.current = null;
    accuracyRef.current?.setMap(null);
    accuracyRef.current = null;
    setGeo({ kind: 'idle' });
  };

  const startTracking = async () => {
    if (!('geolocation' in navigator)) {
      setGeo({ kind: 'unavailable', message: 'This browser does not support location tracking.' });
      return;
    }

    // Pre-check permission so we can explain before the browser prompt appears.
    try {
      const perm = await (navigator as any).permissions?.query?.({ name: 'geolocation' });
      if (perm?.state === 'denied') {
        setGeo({ kind: 'denied' });
        return;
      }
    } catch {
      /* Permissions API unsupported — fall through to the normal prompt. */
    }

    setGeo({ kind: 'prompting' });
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const google = (window as any).google;
        if (!google || !mapRef.current) return;
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGeo({ kind: 'tracking' });

        if (!userMarkerRef.current) {
          userMarkerRef.current = new google.maps.Marker({
            position: p,
            map: mapRef.current,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: '#22c55e',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            title: 'You are here',
            zIndex: 999,
          });
          accuracyRef.current = new google.maps.Circle({
            map: mapRef.current,
            center: p,
            radius: pos.coords.accuracy || 30,
            strokeColor: '#22c55e',
            strokeOpacity: 0.4,
            strokeWeight: 1,
            fillColor: '#22c55e',
            fillOpacity: 0.12,
          });
          mapRef.current.panTo(p);
        } else {
          userMarkerRef.current.setPosition(p);
          accuracyRef.current?.setCenter(p);
          accuracyRef.current?.setRadius(pos.coords.accuracy || 30);
        }
      },
      (err) => {
        if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setGeo(geoMessage(err));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  };

  const isTracking = geo.kind === 'tracking' || geo.kind === 'prompting';

  if (!GOOGLE_KEY) {
    return (
      <div className="w-full rounded-2xl bg-secondary border border-border p-6 text-center space-y-3">
        <AlertCircle className="w-5 h-5 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Interactive map is unavailable right now, but your route still works.
        </p>
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <a href={routeUrl} target="_blank" rel="noopener noreferrer">
            Open route in Google Maps <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          ref={mapDivRef}
          className="w-full h-[300px] sm:h-[380px] lg:h-[440px] rounded-2xl overflow-hidden border border-border shadow-lg bg-secondary"
        />

        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 backdrop-blur-sm rounded-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Plotting your route…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center bg-background/90 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              We couldn't load the live map{error ? ` (${error})` : ''}.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => setAttempt((a) => a + 1)}>
                <RefreshCw className="w-3.5 h-3.5" /> Try again
              </Button>
              <Button asChild size="sm" className="rounded-xl">
                <a href={routeUrl} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {status === 'ready' && (
          <>
            <Button
              onClick={isTracking ? stopTracking : startTracking}
              size="sm"
              className={`absolute top-3 right-3 gap-1.5 rounded-full shadow-lg ${
                isTracking ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary'
              }`}
            >
              <Locate className={`w-4 h-4 ${isTracking ? 'animate-pulse' : ''}`} />
              <span className="hidden xs:inline sm:inline">
                {geo.kind === 'prompting' ? 'Locating…' : isTracking ? 'Stop tracking' : 'Track me'}
              </span>
            </Button>
            <div className="absolute bottom-3 left-3 glass-strong rounded-xl px-3 py-2 text-[11px] sm:text-xs flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{coords.length} of {places.length} stops plotted</span>
            </div>
          </>
        )}
      </div>

      {/* Friendly, non-blocking location messaging */}
      {geo.kind === 'denied' && (
        <div className="rounded-xl border border-border bg-secondary/60 p-3 flex gap-3 text-xs sm:text-sm">
          <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-medium text-foreground">Location access is blocked</p>
            <p className="text-muted-foreground">
              Tap the lock icon in your browser's address bar, set <strong>Location</strong> to “Allow”,
              then try again. Everything else on this map keeps working without it.
            </p>
            <Button size="sm" variant="outline" className="rounded-lg h-8 gap-1.5" onClick={startTracking}>
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </Button>
          </div>
        </div>
      )}

      {geo.kind === 'unavailable' && (
        <div className="rounded-xl border border-border bg-secondary/60 p-3 flex gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="text-muted-foreground">{geo.message}</p>
            <Button size="sm" variant="outline" className="rounded-lg h-8 gap-1.5" onClick={startTracking}>
              <RefreshCw className="w-3.5 h-3.5" /> Try again
            </Button>
          </div>
        </div>
      )}

      {geo.kind === 'tracking' && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Following your live location. Battery-friendly updates every few seconds.
        </p>
      )}

      {status === 'ready' && (
        <a
          href={routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          Open this route in Google Maps <ExternalLink className="w-3.5 h-3.5" />
        </a>
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
