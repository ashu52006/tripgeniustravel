import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, LogIn, LogOut, MessageSquareText, ShieldCheck, User, UserCog, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { lovable } from '@/integrations/lovable/index';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AuthButton() {
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (error) console.error('Sign in error:', error);
    } catch (e) {
      console.error('Sign in error:', e);
    }
    setIsSigningIn(false);
  };

  if (loading) return null;

  if (!user) {
    return (
      <Button
        onClick={handleSignIn}
        disabled={isSigningIn}
        variant="outline"
        size="sm"
        className="gap-2 rounded-full border-primary/30 hover:bg-primary/10"
      >
        <LogIn className="w-4 h-4" />
        {t('signIn')}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          {user.email}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2">
          <UserCog className="w-4 h-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/wishlist')} className="gap-2">
          <Heart className="w-4 h-4" /> Wishlist
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/wallet')} className="gap-2">
          <Wallet className="w-4 h-4" /> Wallet & rewards
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/reviews')} className="gap-2">
          <MessageSquareText className="w-4 h-4" /> Reviews
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/admin')} className="gap-2">
            <ShieldCheck className="w-4 h-4" /> Admin console
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive">
          <LogOut className="w-4 h-4" />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
