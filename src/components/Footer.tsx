import { Link } from 'react-router-dom';
import { Plane, Mail, MapPin, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 mt-20 border-t border-border/50 bg-card/40 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
                <Plane className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-gradient-hero">TripGenius</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered travel companion. Plan smarter, spend better, travel further.
            </p>
            <div className="flex gap-2 mt-4">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="w-8 h-8 rounded-full bg-secondary hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><a href="mailto:support@tripgenius.ai" className="hover:text-primary transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm">Reach us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <a href="mailto:support@tripgenius.ai" className="hover:text-primary transition-colors">
                  support@tripgenius.ai
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>Hyderabad, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {year} TripGenius. Made with ❤ for travellers.</p>
          <p>All trip data is AI-assisted — verify bookings before payment.</p>
        </div>
      </div>
    </footer>
  );
}
