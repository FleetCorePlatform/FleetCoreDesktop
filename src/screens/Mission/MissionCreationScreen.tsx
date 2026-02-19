import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTheme } from '@/ThemeProvider.tsx';
import { MissionSidebar } from './components/MissionSidebar';
import { MissionMap } from './components/MissionMap';
import { apiCallFull } from '@/utils/api.ts';
import { CreateMissionRequest } from '@/screens/Mission/types.ts';
import { GroupSummary, OutpostSummary } from '@/screens/common/types.ts';

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

  const [jobName, setJobName] = useState('');
  const [missionAltitude, setMissionAltitude] = useState([50]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const polygonPositions: L.LatLngExpression[] = useMemo(() => {
    if (!outpost?.area) return [];
    return outpost.area.points.map((p) => [p.y, p.x] as [number, number]);
  }, [outpost]);

  const handleConfirmMission = async () => {
    if (!outpost || !groupData) return;
    setIsSubmitting(true);

    const payload: CreateMissionRequest = {
      outpostUuid: outpost.uuid,
      groupUuid: groupData.groupUUID,
      altitude: missionAltitude[0],
      jobName: jobName,
    };

    await apiCallFull('/api/v1/missions', undefined, 'POST', payload)
      .then((res) => {
        if (res.status === 200) {
          navigate(`/missions/${groupData.groupUUID}`);
        }
      })
      .catch((e) => console.error('Error while creating mission: ', e));
  };

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[1400] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <MissionSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          outpost={outpost}
          missionAltitude={missionAltitude}
          jobName={jobName}
          setMissionAltitude={setMissionAltitude}
          setJobName={setJobName}
          isSubmitting={isSubmitting}
          handleConfirmMission={handleConfirmMission}
          navigate={navigate}
        />

        <MissionMap
          outpost={outpost}
          theme={theme}
          polygonPositions={polygonPositions}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>
    </div>
  );
}
