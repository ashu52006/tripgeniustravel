import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useSeo } from '@/hooks/useSeo';
import { toast } from 'sonner';

const ADMIN_USERNAME = 'tripgenius@login';
const ADMIN_EMAIL = 'tripgenius@login.tripgenius.app';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useSeo({ title: 'Admin Login | TripGenius', description: 'TripGenius administrator sign-in.', noIndex: true });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() !== ADMIN_USERNAME) {
      return toast.error('Invalid admin username');
    }
    setBusy(true);
    try {
      // Makes sure the admin account exists (never overwrites an existing password).
      await supabase.functions.invoke('admin-bootstrap');
      const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
      if (error) throw error;
      toast.success('Welcome back, admin');
      navigate('/admin');
    } catch (err) {
      toast.error((err as Error).message || 'Could not sign in');
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="glass-strong rounded-3xl p-8 w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <ShieldCheck className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-2xl font-display font-bold">Admin login</h1>
          <p className="text-sm text-muted-foreground">Restricted area — administrators only.</p>
        </div>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full rounded-xl" disabled={busy || !username || !password}>
          {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Sign in
        </Button>
        <Link to="/" className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3 h-3" /> Back to app
        </Link>
      </form>
    </div>
  );
}
