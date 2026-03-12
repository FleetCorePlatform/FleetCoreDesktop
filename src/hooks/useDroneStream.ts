import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@/context/UserContext.ts';
import { startViewer, stopViewer, ViewerHandle } from '@/utils/kvsClient.ts';
import { setManualControlChannel } from '@/utils/droneManualControl.ts';
import { apiCallFull } from '@/utils/api.ts';
import { DroneSummaryModel } from '@/screens/Group/types.ts';
import { StreamState } from '@/screens/Drone/types.ts';

export function useDroneStream(drone: DroneSummaryModel) {
  const { credentials } = useUser();
  const [streamActive, setStreamActive] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const viewerHandleRef = useRef<ViewerHandle | null>(null);
  const streamStateRef = useRef<StreamState>('idle');
  const remoteEnabledRef = useRef(false);
  const teardownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const credentialsRef = useRef(credentials);
  const droneRef = useRef(drone);
  useEffect(() => {
    credentialsRef.current = credentials;
  }, [credentials]);
  useEffect(() => {
    droneRef.current = drone;
  }, [drone]);

  const enableRemoteStream = useRef(async (enabled: boolean) => {
    const d = droneRef.current;
    if (!d?.uuid || enabled === remoteEnabledRef.current) return;
    try {
      await apiCallFull(`/api/v1/drones/${d.uuid}/stream`, undefined, 'POST', { enabled: enabled });
      remoteEnabledRef.current = enabled;

      console.log(`Sending shouldStream value: ${enabled}`)
    } catch (e) {
      console.error('Error toggling stream:', e);
    }
  });

  const teardown = useRef((delay = 0) => {
    if (teardownTimerRef.current) clearTimeout(teardownTimerRef.current);
    teardownTimerRef.current = setTimeout(() => {
      enableRemoteStream.current(false);
      stopViewer(viewerHandleRef.current);
      viewerHandleRef.current = null;
      setManualControlChannel(null);
      setStreamActive(false);
      streamStateRef.current = 'idle';
      remoteEnabledRef.current = false;
    }, delay);
  });

  const initStream = useRef(async () => {
    const creds = credentialsRef.current;
    const d = droneRef.current;
    if (!creds || !d || streamStateRef.current !== 'idle') return;

    streamStateRef.current = 'pending';
    setStreamError(null);

    try {
      await enableRemoteStream.current(true);
      stopViewer(viewerHandleRef.current);

      const handle = await startViewer(
        videoRef.current!,
        creds,
        'eu-central-1',
        d.signaling_channel_name
      );
      viewerHandleRef.current = handle;
      streamStateRef.current = 'active';
      setStreamActive(true);
      if (handle?.dataChannel) setManualControlChannel(handle.dataChannel);
    } catch (err) {
      streamStateRef.current = 'idle';
      setStreamActive(false);
      setStreamError(err.message || 'Connection Failed');
      setManualControlChannel(null);
    }
  });

  useEffect(() => {
    initStream.current();
    return () => {
      if (streamStateRef.current !== 'pending') teardown.current(500);
    };
  }, [retryTrigger]);

  const retry = useCallback(() => {
    teardown.current(0);
    setTimeout(() => {
      streamStateRef.current = 'idle';
      setRetryTrigger((p) => p + 1);
    }, 50);
  }, []);

  return { videoRef, viewerHandleRef, streamActive, streamError, retry };
}
