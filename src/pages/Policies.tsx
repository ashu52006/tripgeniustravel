import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

type PolicyKind = 'privacy' | 'terms' | 'refund' | 'cookies' | 'about' | 'contact';

const CONTENT: Record<PolicyKind, { title: string; body: React.ReactNode }> = {
  privacy: {
    title: 'Privacy Policy',
    body: (
      <>
        <p>
          This page is maintained by TripGenius to explain what data we collect and how we
          use it. TripGenius is an AI-assisted travel planning app; we handle only the
          data required to generate itineraries and let you save or share them.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>Account data from Google Sign-In: name, email, profile photo.</li>
          <li>Trip inputs you provide: origin, destination, dates, travellers, budget.</li>
          <li>Trips you explicitly save or share, stored against your account.</li>
        </ul>
        <h2>How we use it</h2>
        <ul>
          <li>Generate personalised itineraries via our AI provider.</li>
          <li>Show your saved trips on the "My Trips" screen.</li>
          <li>Render shared-trip links only when the exact share URL is opened.</li>
        </ul>
        <h2>What we do not do</h2>
        <ul>
          <li>We do not sell your data to third parties.</li>
          <li>We do not enumerate other users' shared trips — access requires the link.</li>
          <li>We do not store payment card details; payments are processed by Razorpay.</li>
        </ul>
        <h2>Your rights</h2>
        <p>
          You can delete any saved trip from "My Trips". To delete your account and all
          associated data, email <a href="mailto:support@tripgenius.ai">support@tripgenius.ai</a>.
        </p>
      </>
    ),
  },
  terms: {
    title: 'Terms of Service',
    body: (
      <>
        <p>By using TripGenius you agree to the terms below.</p>
        <h2>Service description</h2>
        <p>
          TripGenius provides AI-generated travel plans, budget estimates, place
          suggestions and shareable itineraries. Outputs are estimates; actual prices,
          availability and travel conditions vary.
        </p>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not use TripGenius to plan illegal activities.</li>
          <li>Do not attempt to scrape or resell AI-generated content at scale.</li>
          <li>Respect other users when sharing links.</li>
        </ul>
        <h2>Subscriptions</h2>
        <p>
          Paid tiers (Silver / Gold / Platinum) unlock features such as full itinerary
          access, day editing, unlimited saved trips and live map tracking. Prices are
          shown on the Subscription page.
        </p>
        <h2>Liability</h2>
        <p>
          TripGenius is not a booking platform. We are not liable for missed flights,
          hotel unavailability or trip disruptions. Always verify bookings independently
          before paying.
        </p>
      </>
    ),
  },
  refund: {
    title: 'Refund Policy',
    body: (
      <>
        <h2>Subscription refunds</h2>
        <p>
          If you are unhappy with a paid subscription, email us within <strong>7 days</strong> of
          purchase at <a href="mailto:support@tripgenius.ai">support@tripgenius.ai</a> and we will
          issue a full refund via Razorpay to your original payment method.
        </p>
        <h2>Payment failures</h2>
        <p>
          If your card is charged but the subscription is not activated within 15 minutes,
          contact us with the Razorpay payment ID. We will reconcile within 2 business days.
        </p>
        <h2>Non-refundable</h2>
        <ul>
          <li>Third-party bookings (flights, hotels) made outside TripGenius.</li>
          <li>Fees charged by your bank for cross-border transactions.</li>
        </ul>
        <h2>Processing time</h2>
        <p>Approved refunds reach your account in 5–10 business days.</p>
      </>
    ),
  },
  cookies: {
    title: 'Cookie Policy',
    body: (
      <>
        <p>TripGenius uses cookies and local storage for the following:</p>
        <ul>
          <li>Authentication session (so you stay signed in).</li>
          <li>Language and region preferences.</li>
          <li>Basic anonymous analytics to improve the product.</li>
        </ul>
        <p>
          We do not use advertising cookies or third-party trackers. You can clear cookies
          any time from your browser settings.
        </p>
      </>
    ),
  },
  about: {
    title: 'About TripGenius',
    body: (
      <>
        <p>
          TripGenius is a 24/7 AI travel companion that turns "I want to visit Goa for 5
          days" into a full itinerary — with places, timings, dual-currency budgets, map
          links and taxi fare estimates.
        </p>
        <h2>Our mission</h2>
        <p>
          Trust → Reliability → Personalisation → Scale. We believe planning a trip should
          take minutes, not weekends of tab-juggling.
        </p>
        <h2>How it works</h2>
        <ol>
          <li>Tell us where you're going and for how long.</li>
          <li>Pick a budget tier — Backpacker to Luxury.</li>
          <li>Get a day-by-day plan with places, costs and a live map.</li>
        </ol>
        <h2>Built by</h2>
        <p>A small team of travellers and product folks based in Hyderabad, India.</p>
      </>
    ),
  },
  contact: {
    title: 'Contact us',
    body: (
      <div className="not-prose grid gap-4 md:grid-cols-3 mt-6">
        {[
          { icon: Mail, label: 'Email', value: 'support@tripgenius.ai', href: 'mailto:support@tripgenius.ai' },
          { icon: Phone, label: 'WhatsApp', value: '+91 90000 00000', href: 'https://wa.me/919000000000' },
          { icon: MapPin, label: 'Office', value: 'Hyderabad, India' },
        ].map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{label}</h3>
            {href ? (
              <a href={href} className="text-sm text-primary hover:underline break-all">{value}</a>
            ) : (
              <p className="text-sm text-muted-foreground">{value}</p>
            )}
          </div>
        ))}
      </div>
    ),
  },
};

export default function Policies({ kind }: { kind: PolicyKind }) {
  const { title, body } = CONTENT[kind];
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-12 pb-16">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1 mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-hero mb-2">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <article className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-h2:text-xl prose-h2:mt-8 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
          {body}
        </article>
      </div>
      <Footer />
    </div>
  );
}
