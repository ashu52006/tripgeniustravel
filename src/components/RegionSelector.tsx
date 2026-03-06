import { motion } from 'framer-motion';
import { Globe, ArrowRight } from 'lucide-react';
import { UserRegion, regionCurrencies } from '@/types/trip';
import { useLanguage } from '@/contexts/LanguageContext';

interface RegionSelectorProps {
  onSelect: (region: UserRegion) => void;
}

const regions: { value: UserRegion; label: string; flag: string; cities: string }[] = [
  { value: 'india', label: 'India', flag: '🇮🇳', cities: 'Delhi, Mumbai, Bangalore...' },
  { value: 'usa', label: 'United States', flag: '🇺🇸', cities: 'New York, LA, Chicago...' },
  { value: 'uk', label: 'United Kingdom', flag: '🇬🇧', cities: 'London, Manchester...' },
  { value: 'europe', label: 'Europe', flag: '🇪🇺', cities: 'Paris, Berlin, Rome...' },
  { value: 'uae', label: 'UAE', flag: '🇦🇪', cities: 'Dubai, Abu Dhabi...' },
  { value: 'japan', label: 'Japan', flag: '🇯🇵', cities: 'Tokyo, Osaka, Kyoto...' },
  { value: 'china', label: 'China', flag: '🇨🇳', cities: 'Beijing, Shanghai...' },
  { value: 'korea', label: 'South Korea', flag: '🇰🇷', cities: 'Seoul, Busan...' },
  { value: 'australia', label: 'Australia', flag: '🇦🇺', cities: 'Sydney, Melbourne...' },
  { value: 'brazil', label: 'Brazil', flag: '🇧🇷', cities: 'São Paulo, Rio...' },
  { value: 'canada', label: 'Canada', flag: '🇨🇦', cities: 'Toronto, Vancouver...' },
  { value: 'other', label: 'Other', flag: '🌍', cities: 'Anywhere else' },
];

export default function RegionSelector({ onSelect }: RegionSelectorProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-ocean" />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-40 opacity-20"
          style={{ background: 'linear-gradient(to right, hsl(200 100% 55% / 0.2), hsl(170 80% 45% / 0.2), hsl(200 100% 55% / 0.2))' }}
          animate={{ x: ['-25%', '25%', '-25%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-center mb-10"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <Globe className="w-16 h-16 text-primary" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-hero mb-3">
          Where are you from?
        </h1>
        <p className="text-muted-foreground text-lg">
          Select your region so we can show prices in your currency
        </p>
      </motion.div>

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl w-full">
        {regions.map((region, i) => (
          <motion.button
            key={region.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => onSelect(region.value)}
            className="glass rounded-2xl p-5 text-left hover:shadow-glow hover:border-primary/30 transition-all duration-300 group"
          >
            <span className="text-4xl block mb-2">{region.flag}</span>
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-1">
              {region.label}
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{region.cities}</p>
            <p className="text-xs text-primary mt-1 font-medium">
              {regionCurrencies[region.value].symbol} {regionCurrencies[region.value].code}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
