import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardFooter } from '@/components/ui/card.tsx';
import { useState } from 'react';
import { signOut } from 'aws-amplify/auth';
import { Coordinator } from './types';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileCardHeader } from './components/ProfileCardHeader';
import { ProfileForm } from './components/ProfileForm';

export interface CoordinatorProfileScreenProps {
  profile: Coordinator | null;
}

export type { Coordinator };

export default function CoordinatorProfileScreen({ profile }: CoordinatorProfileScreenProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out: ', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (profile?.uuid) {
      navigator.clipboard.writeText(profile.uuid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center text-[hsl(var(--text-secondary))]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--accent))]"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-auto">
      <div className="max-w-[600px] mx-auto w-full p-4 lg:p-8 space-y-6">
        <ProfileHeader />

        {/* Identity Card */}
        <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] overflow-hidden">
          <ProfileCardHeader profile={profile} initials={initials} />
          <ProfileForm profile={profile} copyToClipboard={copyToClipboard} copied={copied} />

          <CardFooter className="bg-[hsl(var(--bg-tertiary))]/30 border-t border-[hsl(var(--border-primary))] p-6">
            <Button
              onClick={handleLogout}
              disabled={loading}
              variant="outline"
              className="w-full bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-secondary))] transition-all"
            >
              <LogOut size={16} className="mr-2" />
              {loading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-[hsl(var(--text-muted))]">
          Session ID: {profile.uuid.substring(0, 8)}...
        </p>
      </div>
    </div>
  );
}
