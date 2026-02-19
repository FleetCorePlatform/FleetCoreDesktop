import { useState, useEffect } from 'react';
import { apiCall } from '@/utils/api.ts';
import 'leaflet/dist/leaflet.css';

import { OutpostListHeader } from './components/OutpostListHeader';
import { OutpostListStats } from './components/OutpostListStats';
import { OutpostListGrid } from './components/OutpostListGrid';
import { Outpost } from '@/screens/common/types.ts';

export default function OutpostListScreen() {
  const [outposts, setOutposts] = useState<Outpost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const calculateGeoPolygonArea = (points: Array<{ x: number; y: number }>): number => {
    if (!points || points.length < 3) return 0;

    const EARTH_RADIUS = 6371000;
    const TO_RAD = Math.PI / 180;

    const centerLat = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const cosLat = Math.cos(centerLat * TO_RAD);

    let area = 0;

    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const x1 = points[i].x * TO_RAD * EARTH_RADIUS * cosLat;
      const y1 = points[i].y * TO_RAD * EARTH_RADIUS;
      const x2 = points[j].x * TO_RAD * EARTH_RADIUS * cosLat;
      const y2 = points[j].y * TO_RAD * EARTH_RADIUS;

      area += x1 * y2 - x2 * y1;
    }

    return Math.abs(area) / 2 / 1_000_000;
  };

  const totalArea = outposts.reduce((acc, curr) => {
    return acc + calculateGeoPolygonArea(curr.area?.points || []);
  }, 0);

  useEffect(() => {
    const fetchOutposts = async () => {
      try {
        const data = await apiCall<Outpost>('/api/v1/outposts', undefined, 'GET');

        if (Array.isArray(data)) {
          const isSamePoint = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
            const epsilon = 0.000001;
            return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
          };

          const cleanOutposts = data.map((op: Outpost) => {
            const pts = op.area?.points || [];

            if (pts.length >= 3) {
              const first = pts[0];
              const last = pts[pts.length - 1];

              if (isSamePoint(first, last)) {
                return {
                  ...op,
                  area: { ...op.area, points: pts.slice(0, -1) },
                };
              }
            }
            return op;
          });

          setOutposts(cleanOutposts);
        } else {
          setOutposts([]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutposts();
  }, []);

  const filteredOutposts = outposts.filter((op) =>
    (op.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgComplexity =
    outposts.length > 0
      ? (
          outposts.reduce((acc, o) => acc + (o.area?.points?.length || 0), 0) / outposts.length
        ).toFixed(1)
      : '0.0';

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-primary))] font-sans overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6">
          {/* --- Page Header --- */}
          <OutpostListHeader />

          {/* --- Stats Overview --- */}
          <OutpostListStats
            outpostsCount={outposts.length}
            totalArea={totalArea}
            avgComplexity={avgComplexity}
          />

          {/* --- Grid Content with Filters --- */}
          <OutpostListGrid
            loading={loading}
            filteredOutposts={filteredOutposts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      </div>
    </div>
  );
}
