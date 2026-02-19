import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Battery,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  ShieldCheck,
  Timer,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { apiCall, apiCallFull } from '@/utils/api.ts';
import { CancelMissionRequest, MissionBodyEnum, MissionDetails } from '@/screens/Mission/types.ts';
import { Badge } from '@/components/ui/badge.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import { Mission } from '@/screens/common/types.ts';

export default function MissionItem({
  mission,
  groupUuid,
  formatTime,
  getDuration,
}: {
  mission: Mission;
  groupUuid: string;
  formatDate: (d: string) => string;
  formatTime: (d: string) => string;
  getDuration: (s: string, e?: string) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [details, setDetails] = useState<MissionDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const hasThreats = mission.detectionCount > 0;

  const isActive = (status?: string) => {
    if (!status) return false;
    return ['IN_PROGRESS', 'RUNNING', 'QUEUED', 'PENDING'].includes(status.toUpperCase());
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCEEDED':
      case 'COMPLETED':
        return 'text-emerald-500 border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20';
      case 'FAILED':
      case 'CANCELLED':
      case 'REJECTED':
      case 'ABORTED':
        return 'text-red-500 border-red-500/50 bg-red-500/10 hover:bg-red-500/20';
      case 'IN_PROGRESS':
      case 'RUNNING':
        return 'text-blue-500 border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 animate-pulse';
      case 'QUEUED':
      case 'PENDING':
      default:
        return 'text-zinc-500 border-zinc-500/50 bg-zinc-500/10 hover:bg-zinc-500/20';
    }
  };

  const handleToggle = async (e?: React.MouseEvent) => {
    if (e?.defaultPrevented) return;

    const nextState = !isExpanded;
    setIsExpanded(nextState);

    if (nextState && !details) {
      setIsLoadingDetails(true);
      try {
        const data = await apiCall<MissionDetails>(
          `/api/v1/missions/${mission.missionUuid}`,
          undefined,
          'GET'
        );
        setDetails(data);
      } catch (e) {
        console.error('Failed to load mission details', e);
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  const handleCancelMission = async () => {
    setIsCancelling(true);
    const payload: CancelMissionRequest = {
      status: MissionBodyEnum.CANCELLED,
    };

    await apiCallFull(`/api/v1/missions/${mission.missionUuid}`, undefined, 'PATCH', payload)
      .then((res) => {
        if (res.status === 204) {
          setDetails((prev) =>
            prev ? { ...prev, jobStatus: 'CANCELLED', finishedAt: new Date().toISOString() } : null
          );
          setShowCancelDialog(false);
        } else {
          console.log(`Error while sending cancel request, got status ${res.status}`);
        }
      })
      .catch((e) => console.error('Error while sending cancel request: ', e))
      .finally(() => setIsCancelling(false));
  };

  return (
    <>
      <div className="relative pl-8 group mb-4">
        {/* Timeline Node */}
        <div
          className={`absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--bg-primary))] z-10 transition-all duration-300
                    ${hasThreats ? 'bg-red-500 ring-4 ring-red-500/10' : 'bg-emerald-500/50'}
                    ${isExpanded ? 'scale-125 ring-offset-2 ring-offset-[hsl(var(--bg-primary))]' : ''}`}
        />

        {/* Main Card */}
        <div
          onClick={handleToggle}
          className={`rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer
                    ${
                      hasThreats
                        ? 'bg-red-950/5 border-red-500/30 hover:border-red-500/50'
                        : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--accent))]'
                    } ${isExpanded ? 'ring-1 ring-[hsl(var(--accent))] border-[hsl(var(--accent))] shadow-lg shadow-black/20' : ''}`}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row">
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3
                    className={`font-bold text-sm truncate flex items-center gap-2 ${hasThreats ? 'text-red-100' : 'text-[hsl(var(--text-primary))]'}`}
                  >
                    {mission.name || 'Untitled Operation'}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 text-[hsl(var(--text-muted))] ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start sm:gap-4 mt-2 text-xs text-[hsl(var(--text-secondary))]">
                <span className="flex items-center gap-1 bg-[hsl(var(--bg-tertiary))] px-2 py-0.5 rounded text-[10px] font-mono border border-[hsl(var(--border-primary))]">
                  <Clock size={10} />
                  {formatTime(mission.startTime)}
                </span>

                <span className="flex items-center gap-1 text-[hsl(var(--text-muted))]">
                  <Timer size={10} />
                  {details
                    ? getDuration(details.startedAt, details.finishedAt)
                    : 'Click for details'}
                </span>
              </div>
            </div>

            {/* Right Metrics */}
            <div
              className={`p-4 sm:w-40 flex flex-col justify-center border-t sm:border-t-0 sm:border-l ${hasThreats ? 'border-red-500/20 bg-red-500/5' : 'border-[hsl(var(--border-primary))] bg-[hsl(var(--bg-tertiary))]'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-secondary))]">
                  Detections
                </span>
                <span
                  className={`text-lg font-mono font-bold ${hasThreats ? 'text-red-500' : 'text-[hsl(var(--text-muted))]'}`}
                >
                  {mission.detectionCount}
                </span>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {hasThreats ? (
                  <Link to={`/detections/${groupUuid}/${mission.missionUuid}`}>
                    <Button
                      size="sm"
                      className="w-full h-7 text-xs bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 shadow-none"
                    >
                      Review <ChevronRight size={12} className="ml-1 opacity-70" />
                    </Button>
                  </Link>
                ) : (
                  <div className="h-7 flex items-center justify-center text-[10px] text-emerald-500/50 font-medium uppercase tracking-widest gap-1 cursor-default">
                    <ShieldCheck size={12} /> Clear
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Details Section */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="overflow-hidden bg-[hsl(var(--bg-tertiary))] border-t border-[hsl(var(--border-primary))]">
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoadingDetails ? (
                  <>
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-[hsl(var(--border-primary))] rounded animate-pulse" />
                      <div className="h-8 w-full bg-[hsl(var(--border-primary))] rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-[hsl(var(--border-primary))] rounded animate-pulse" />
                      <div className="h-8 w-full bg-[hsl(var(--border-primary))] rounded animate-pulse" />
                    </div>
                  </>
                ) : details ? (
                  <>
                    <div className="col-span-1 p-3 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-primary))] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[hsl(var(--text-muted))] mb-1">
                          <Activity size={12} /> Job Status
                        </div>
                        <div className="font-mono text-sm font-bold text-[hsl(var(--text-primary))]">
                          <Badge variant="outline" className={getStatusStyles(details.jobStatus)}>
                            {details.jobStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Abort Button */}
                      {isActive(details.jobStatus) && (
                        <div className="mt-3 pt-3 border-t border-[hsl(var(--border-primary))]">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCancelDialog(true);
                            }}
                            variant="destructive"
                            className="w-full h-7 text-xs bg-red-600 hover:bg-red-700 text-white border-none shadow-sm"
                          >
                            <XCircle className="mr-2 h-3 w-3" />
                            Abort
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 p-3 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-primary))]">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[hsl(var(--text-muted))] mb-1">
                        <Calendar size={12} /> Finished At
                      </div>
                      <div className="font-mono text-sm font-bold text-[hsl(var(--text-primary))]">
                        {details.finishedAt ? formatTime(details.finishedAt) : '---'}
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 lg:col-span-2 p-3 rounded bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-primary))]">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[hsl(var(--text-muted))] mb-1">
                        <Battery size={12} /> Execution Summary
                      </div>
                      <div className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                        Mission started at{' '}
                        <span className="text-[hsl(var(--text-primary))]">
                          {formatTime(details.startedAt)}
                        </span>
                        .
                        {details.finishedAt
                          ? ` Completed successfully at ${formatTime(details.finishedAt)}.`
                          : ' Execution is currently ongoing.'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 text-center text-xs text-red-400 py-4">
                    Failed to load detailed status.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Abort Mission?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--text-secondary))]">
              This action will immediately send a Return-To-Launch (RTL) command to all drones
              involved in this mission. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[hsl(var(--border-primary))] hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">
              Keep Running
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelMission();
              }}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aborting...
                </>
              ) : (
                'Yes, Abort Mission'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
