import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Phone, Users, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { useCountdown } from '@/hooks/useCountdown';
import { isPremium } from '@/lib/entitlements';
import LockedOverlay from './LockedOverlay';

interface Props {
  onComplete: () => void;
  onUpgrade: () => void;
}

type Step = 'notify' | 'verify' | 'buddy' | 'prefs';

export default function OnboardingFlow({ onComplete, onUpgrade }: Props) {
  const { profile, update } = useProfile();
  const [step, setStep] = useState<Step>('notify');
  const [channel, setChannel] = useState<'gmail' | 'mobile' | null>(null);
  const [otp, setOtp] = useState('');
  const [buddyOn, setBuddyOn] = useState(false);
  const [showBuddyLock, setShowBuddyLock] = useState(false);

  const premium = isPremium(profile?.plan);

  const finish = async () => {
    await update({ has_completed_onboarding: true, show_name_to_companions: buddyOn && premium });
    toast.success('Welcome aboard! ✈️');
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto px-4 py-12 pt-28"
    >
      <div className="flex gap-1.5 mb-6">
        {(['notify', 'verify', 'buddy', 'prefs'] as Step[]).map((s, i) => {
          const active = s === step;
          const done = (['notify', 'verify', 'buddy', 'prefs'] as Step[]).indexOf(step) > i;
          return (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                done ? 'bg-primary' : active ? 'bg-primary/60' : 'bg-secondary'
              }`}
            />
          );
        })}
      </div>

      {step === 'notify' && (
        <div className="glass-strong rounded-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Bell className="w-7 h-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">Stay in the loop</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Get trip alerts, budget nudges and weather warnings.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={async () => { await update({ notification_choice: 'declined' }); setStep('verify'); }}>
              Not now
            </Button>
            <Button onClick={async () => { await update({ notification_choice: 'allowed' }); setStep('verify'); }}>
              Allow
            </Button>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <VerifyStep
          channel={channel}
          setChannel={setChannel}
          otp={otp}
          setOtp={setOtp}
          onDone={() => setStep('buddy')}
        />
      )}

      {step === 'buddy' && (
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Travel Buddy visibility</h2>
              <p className="text-xs text-muted-foreground">Let matched companions see your name.</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
            <span className="text-sm font-medium">Show my name to companions</span>
            <Switch
              checked={buddyOn}
              onCheckedChange={(v) => {
                if (v && !premium) {
                  setShowBuddyLock(true);
                  return;
                }
                setBuddyOn(v);
                setShowBuddyLock(false);
              }}
            />
          </div>

          {showBuddyLock && (
            <div className="mt-3">
              <LockedOverlay
                feature="buddyVisibility"
                variant="inline"
                onUnlock={onUpgrade}
              />
              <button
                className="text-xs text-muted-foreground hover:text-foreground mt-2"
                onClick={() => { setShowBuddyLock(false); setBuddyOn(false); }}
              >
                Maybe later
              </button>
            </div>
          )}

          <Button className="w-full mt-6" onClick={() => setStep('prefs')}>Continue</Button>
        </div>
      )}

      {step === 'prefs' && (
        <div className="glass-strong rounded-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">You're all set</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            You can fine-tune trip preferences (pace, places, style) on every plan.
          </p>
          <Button className="w-full" onClick={finish}>Start planning</Button>
        </div>
      )}
    </motion.div>
  );
}

function VerifyStep({
  channel, setChannel, otp, setOtp, onDone,
}: {
  channel: 'gmail' | 'mobile' | null;
  setChannel: (c: 'gmail' | 'mobile') => void;
  otp: string;
  setOtp: (s: string) => void;
  onDone: () => void;
}) {
  const { seconds, restart, done } = useCountdown(30);

  if (!channel) {
    return (
      <div className="glass-strong rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-foreground mb-1">Verify it's you</h2>
        <p className="text-sm text-muted-foreground mb-5">Pick a re-verification method.</p>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { setChannel('gmail'); toast.success('Gmail verified'); setTimeout(onDone, 400); }}>
            <Mail className="w-4 h-4" /> Continue with Gmail
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setChannel('mobile')}>
            <Phone className="w-4 h-4" /> Continue with Mobile OTP
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="font-display text-xl font-bold text-foreground mb-1">Enter OTP</h2>
      <p className="text-sm text-muted-foreground mb-4">
        We sent a 6-digit code to your mobile. (Demo: enter any 6 digits)
      </p>
      <Input
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="123456"
        className="text-center text-lg tracking-widest"
      />
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>Resend in {seconds}s</span>
        <button
          disabled={!done}
          onClick={() => { restart(30); toast.success('Code resent'); }}
          className="text-primary disabled:opacity-40"
        >
          Resend code
        </button>
      </div>
      <Button
        className="w-full mt-4"
        disabled={otp.length !== 6}
        onClick={() => { toast.success('Verified'); onDone(); }}
      >
        <Check className="w-4 h-4 mr-1" /> Verify
      </Button>
    </div>
  );
}
