import { apiCall } from '@/utils/api.ts';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HistoryHeader } from './components/HistoryHeader';
import { HistoryTimeline } from './components/HistoryTimeline';
import { Mission } from '@/screens/common/types.ts';

export default function MissionHistoryScreen() {
  const { groupUuid } = useParams<{ groupUuid: string }>();
  const navigate = useNavigate();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      setIsLoading(true);
      await apiCall<Mission[]>('/api/v1/missions', { group_uuid: groupUuid || '' }, 'GET')
        .then((res) => {
          const sorted = res.sort(
            (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );
          setMissions(sorted);
        })
        .catch((e) => {
          console.log('Error while fetching missions: ', e);
          setMissions([]);
        })
        .finally(() => setIsLoading(false));
    };

    fetchMissions();
  }, [groupUuid]);

  const getDuration = (start: string | number, end?: string | number) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();

    if (isNaN(startDate.getTime())) return '--';

    const diffMs = endDate.getTime() - startDate.getTime();
    const totalMins = Math.floor(diffMs / 60000);

    if (totalMins < 0) return '--';
    if (totalMins < 60) {
      return `${totalMins}m`;
    }

    if (totalMins < 1440) {
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return `${hours}h ${mins}m`;
    }

    const days = Math.floor(totalMins / 1440);
    const hours = Math.floor((totalMins % 1440) / 60);
    return `${days}d ${hours}h`;
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalThreats = missions.reduce((acc, curr) => acc + curr.detectionCount, 0);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] relative overflow-hidden">
      <HistoryHeader
        navigate={navigate}
        groupUuid={groupUuid}
        totalSorties={missions.length}
        totalThreats={totalThreats}
      />

      <HistoryTimeline
        isLoading={isLoading}
        missions={missions}
        groupUuid={groupUuid || ''}
        formatDate={formatDate}
        formatTime={formatTime}
        getDuration={getDuration}
      />
    </div>
  );
}
