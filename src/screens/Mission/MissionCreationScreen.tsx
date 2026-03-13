import {useState, useMemo, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTheme } from '@/ThemeProvider.tsx';
import { MissionSidebar } from './components/MissionSidebar';
import { MissionMap } from './components/MissionMap';
import {apiCall, apiCallFull} from '@/utils/api.ts';
import {
  CreateGroupMissionRequest,
  CreateSoloMissionRequest,
  MissionType,
  ProgressState
} from '@/screens/Mission/types.ts';
import { GroupSummary, OutpostSummary } from '@/screens/common/types.ts';
import { SoloMissionMap } from '@/screens/Mission/components/SoloMissionMap.tsx';
import {DroneSummaryModel} from "@/screens/Group/types.ts";
import {MissionOverlay} from "@/screens/Mission/components/MissionOverlay.tsx";
import {MissionCreationProgressbar} from "@/screens/Mission/components/MissionCreationProgressbar.tsx";
import {isPointInPolygon} from "@/screens/Mission/utils/common.ts";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
export default function MissionCreationScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const groupData: GroupSummary = location.state?.groupData;
  const outpost: OutpostSummary = location.state?.outpostData;

  const [drones, setDrones] = useState<DroneSummaryModel[]>([]);
  const [missionType, setMissionType] = useState<MissionType>('FULL');
  const [soloWaypoints, setSoloWaypoints] = useState<Array<{ x: number; y: number }>>([]);
  const [jobName, setJobName] = useState('');

  const [selectedDrones, setSelectedDrones] = useState<string[]>([]);

  const [returnToLaunch, setReturnToLaunch] = useState(true);
  const [missionAltitude, setMissionAltitude] = useState([25]);
  const [cruiseSpeed, setCruiseSpeed] = useState([15]);

  const [schedulerEnabled, setSchedulerEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('12:30');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [missionProgress, setMissionProgress] = useState<ProgressState | null>(null);

  const isValidName = jobName.trim().length > 0 && jobName.length <= 64;

  const hasWaypointOutsideGeofence = useMemo(() => {
    if (!outpost?.area?.points || soloWaypoints.length === 0) return false;
    return soloWaypoints.some((wp) => !isPointInPolygon(wp, outpost.area!.points));
  }, [soloWaypoints, outpost]);

  const polygonPositions: L.LatLngExpression[] = useMemo(() => {
    if (!outpost?.area) return [];
    return outpost.area.points.map((p) => [p.y, p.x] as [number, number]);
  }, [outpost]);

  const canSubmit = useMemo(() => {
    if (drones.length == 0) return false;
    if (!isValidName) return false;
    if (missionType === 'SOLO' && soloWaypoints.length < 2) return false;
    if (missionType === 'SOLO' && selectedDrones.length !== 1) return false;
    if (missionType === 'SOLO' && hasWaypointOutsideGeofence) return false;
    if (missionType === 'SUBSET' && selectedDrones.length === 0) return false;
    if (schedulerEnabled && (scheduledDate == '' || scheduledTime == '')) return false;
    return !isSubmitting;

  }, [jobName, missionType, soloWaypoints, selectedDrones, isSubmitting, schedulerEnabled, scheduledDate, scheduledTime]);

  useEffect(() => {
    setIsLoading(true);
    apiCall<DroneSummaryModel[]>(`/api/v1/groups/${groupData.groupUUID}/drones`, undefined, 'GET')
        .then((res) => {
          if (res.length > 0) {
            setDrones(res);
          } else {
            setError("You cannot start a mission in a group with no members");
          }
        })
        .catch((e) => {
          console.error('Error while fetching drones: ', e);
          setError("Failed to load drones. Please try again.");
        })
        .finally(() => {
          setIsLoading(false);
        });
  }, [groupData, outpost]);

  const onMissionTypeChanged = (newValue: MissionType) => {
    setMissionType(newValue);
    setSelectedDrones([])
  }

  const handleConfirmMission = async () => {
    if (!outpost || !groupData) return;
    setIsSubmitting(true);
    setMissionProgress('calculating');

    const scheduled = schedulerEnabled && scheduledDate && scheduledTime
        ? `${scheduledDate}T${scheduledTime}`
        : null;

    const payload = {
      ...(() => {
        switch (missionType) {
          case 'SOLO':
            return {
              jobName: jobName,
              droneUuid: selectedDrones[0],
              waypoints: soloWaypoints,
              altitude: missionAltitude[0],
              speed: cruiseSpeed[0],
              returnToLaunch: returnToLaunch
            } satisfies CreateSoloMissionRequest;
          case 'FULL':
            return {
              jobName: jobName,
              outpostUuid: outpost.uuid,
              groupUuid: groupData.groupUUID,
              altitude: missionAltitude[0]
            } satisfies CreateGroupMissionRequest;
          case 'SUBSET':
            return {
              jobName: jobName,
              outpostUuid: outpost.uuid,
              groupUuid: groupData.groupUUID,
              droneUuids: selectedDrones,
              altitude: missionAltitude[0]
            } satisfies CreateGroupMissionRequest;
          default:
            throw new Error(`Unhandled mission type: ${missionType}`);
        }
      })(),
      scheduled
    };

    await apiCallFull(`/api/v1/missions/${missionType === 'SOLO' ? 'solo' : 'group'}`, undefined, 'POST', payload)
        .then((res) => {
          if (res.status === 200) {
            setMissionProgress('success');
            setTimeout(() => setMissionProgress(null), 6000);
            setTimeout(() => navigate(`/missions/${groupData.groupUUID}`), 1500);
          } else {
            setMissionProgress('error');
            setTimeout(() => setMissionProgress(null), 9000);
          }
        })
        .catch(() => {
          setMissionProgress('error');
          setTimeout(() => setMissionProgress(null), 9000);
        })
        .finally(() => {
          setIsSubmitting(false)
        });
  };

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
      <MissionOverlay isLoading={isLoading} error={error} onDismiss={() => navigate(-1)} />
      <MissionCreationProgressbar state={missionProgress} />
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[1400] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <MissionSidebar
          drones={drones}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          missionType={missionType}
          onMissionTypeChanged={onMissionTypeChanged}
          outpost={outpost}
          jobName={jobName}
          returnToLaunch={returnToLaunch}
          setReturnToLaunch={setReturnToLaunch}
          missionAltitude={missionAltitude}
          setMissionAltitude={setMissionAltitude}
          cruiseSpeed={cruiseSpeed}
          setCruiseSpeed={setCruiseSpeed}
          setJobName={setJobName}
          selectedDrones={selectedDrones}
          setSelectedDrones={setSelectedDrones}
          schedulerEnabled={schedulerEnabled}
          setSchedulerEnabled={setSchedulerEnabled}
          scheduledDate={scheduledDate}
          setScheduledDate={setScheduledDate}
          scheduledTime={scheduledTime}
          setScheduledTime={setScheduledTime}
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
          handleConfirmMission={handleConfirmMission}
          soloWaypoints={soloWaypoints}
          navigate={navigate}
        />

        {missionType != 'SOLO' ?
          <MissionMap
            outpost={outpost}
            theme={theme}
            polygonPositions={polygonPositions}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />:
          <SoloMissionMap
            soloWaypoints={soloWaypoints}
            setSoloWaypoints={setSoloWaypoints}
            outpost={outpost}
            theme={theme}
            polygonPositions={polygonPositions}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            returnToLaunch={returnToLaunch}
          />
        }
      </div>
    </div>
  );
}
