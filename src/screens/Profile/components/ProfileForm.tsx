import { User, Users, Fingerprint, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { CardContent } from '@/components/ui/card.tsx';
import { Coordinator } from '../types';

interface ProfileFormProps {
  profile: Coordinator;
  copyToClipboard: () => void;
  copied: boolean;
}

export function ProfileForm({ profile, copyToClipboard, copied }: ProfileFormProps) {
  return (
    <CardContent className="space-y-6 pt-6">
      {/* Personal Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
            First Name
          </Label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-2.5 text-[hsl(var(--text-muted))]" />
            <Input
              value={profile.firstName}
              readOnly
              className="pl-9 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] text-[hsl(var(--text-primary))]"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
            Last Name
          </Label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-2.5 text-[hsl(var(--text-muted))]" />
            <Input
              value={profile.lastName}
              readOnly
              className="pl-9 bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] text-[hsl(var(--text-primary))]"
            />
          </div>
        </div>
      </div>

      {/* Groups / Roles Section */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
          Assigned Groups
        </Label>
        <div className="relative">
          <Users size={16} className="absolute left-3 top-3 text-[hsl(var(--text-muted))]" />
          <div className="pl-9 min-h-[2.5rem] bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-secondary))] rounded-md p-2 flex flex-wrap gap-2 items-center">
            {profile.groups && profile.groups.length > 0 ? (
              profile.groups.map((group, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-primary))] border-[hsl(var(--border-primary))]"
                >
                  {group}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-[hsl(var(--text-muted))] italic">
                No groups assigned
              </span>
            )}
          </div>
        </div>
      </div>

      {/* System ID with Copy */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
          Coordinator UUID
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Fingerprint
              size={16}
              className="absolute left-3 top-2.5 text-[hsl(var(--text-muted))]"
            />
            <Input
              value={profile.uuid}
              readOnly
              className="pl-9 font-mono text-xs bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] text-[hsl(var(--text-muted))]"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-secondary))] hover:bg-[hsl(var(--bg-primary))]"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </Button>
        </div>
      </div>
    </CardContent>
  );
}
