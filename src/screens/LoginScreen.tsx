import { useState } from 'react';
import { signIn, confirmSignIn } from 'aws-amplify/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Hexagon, Loader2, LogIn } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

type AuthStep = 'LOGIN' | 'NEW_PASSWORD';

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [step, setStep] = useState<AuthStep>('LOGIN');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });

      if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setStep('NEW_PASSWORD');
      } else if (isSignedIn) {
        onLoginSuccess({ username: email });
      } else {
        console.warn('Unhandled auth step:', nextStep);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { isSignedIn } = await confirmSignIn({
        challengeResponse: newPassword,
        options: {
          userAttributes: {
            given_name: firstName,
            family_name: lastName,
            name: `${firstName} ${lastName}`,
          },
        },
      });

      if (isSignedIn) {
        onLoginSuccess({ username: email });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to set new password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--bg-primary))]">
      <Card className="w-full max-w-md border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-secondary))]">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 text-[hsl(var(--accent))] flex items-center justify-center mb-2">
            <Hexagon size={40} strokeWidth={2} />
          </div>
          <CardTitle className="text-2xl font-bold">FleetCore</CardTitle>
          <CardDescription>
            {step === 'LOGIN'
              ? 'Enter your credentials to access the grid.'
              : 'Set your new password and profile.'}
          </CardDescription>
        </CardHeader>

        {step === 'LOGIN' ? (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="commander@fleet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-white text-black hover:bg-gray-200"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleNewPassword}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-white text-black hover:bg-gray-200"
                type="submit"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Sign In
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
