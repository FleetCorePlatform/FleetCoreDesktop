import { MoreVertical, Trash2, Edit2, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import { useTheme } from '@/ThemeProvider.tsx';
import { apiCallFull } from '@/utils/api.ts';
import { OutpostDecommissionDialog } from './OutpostDecommissionDialog';
import { Outpost } from '@/screens/common/types.ts';

function MapBoundsController({ points }: { points: { x: number; y: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = points.map((p) => [p.y, p.x] as [number, number]);
      map.fitBounds(bounds, { padding: [20, 20], animate: false });
    }
  }, [points, map]);

  return null;
}

function OutpostMapPreview({ outpost }: { outpost: Outpost }) {
  const centerPosition: [number, number] = [outpost.latitude, outpost.longitude];
  const polygonPositions =
    outpost.area?.points?.map((p: any) => [p.y, p.x] as [number, number]) || [];

  const { theme } = useTheme();

  return (
    <MapContainer
      center={centerPosition}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      className="z-0 bg-[hsl(var(--bg-tertiary))]"
    >
      {theme == 'light' ? (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&COPY OpenStreetMap"
        />
      ) : (
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />
      )}
      {polygonPositions.length > 0 && (
        <>
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.15,
              weight: 2,
              dashArray: '5, 5',
            }}
          />
          <MapBoundsController points={outpost.area!.points} />
        </>
      )}
    </MapContainer>
  );
}

const formatTimeAgo = (timestamp: number | null): string => {
  if (!timestamp) return 'Never visited';

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function OutpostCard({ outpost }: { outpost: Outpost }) {
  const [lastVisited, setLastVisited] = useState<string>('Never visited');
  const [isDecommissionDialogOpen, setIsDecommissionDialogOpen] = useState(false);
  const [decommissionInput, setDecommissionInput] = useState('');
  const [decommissionError, setDecommissionError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedVisit = localStorage.getItem(`last_visit_${outpost.uuid}`);
    if (storedVisit) {
      setLastVisited(formatTimeAgo(parseInt(storedVisit, 10)));
    }
  }, [outpost.uuid]);

  const handleDecommissionClick = () => {
    setIsDecommissionDialogOpen(true);
    setDecommissionInput('');
    setDecommissionError(null);
  };

  const confirmDecommission = async () => {
    setDecommissionError(null);
    await apiCallFull(`/api/v1/outposts/${outpost.uuid}`, undefined, 'DELETE')
      .then((res) => {
        if (res.status === 204) {
          setIsDecommissionDialogOpen(false);
          navigate(0);
        } else if (res.status === 304) {
          setDecommissionError('Cannot delete: Outpost is not empty.');
        } else {
          setDecommissionError(`Failed to decommission outpost (Status: ${res.status})`);
          console.error('Failed to decommission outpost, status:', res.status);
        }
      })
      .catch((e) => {
        console.error('Error while deleting outpost: ', e);
        setDecommissionError('Failed to decommission outpost. Please try again.');
      });
  };

  const handleVisit = () => {
    const now = Date.now();
    localStorage.setItem(`last_visit_${outpost.uuid}`, now.toString());
    setLastVisited(formatTimeAgo(now));
  };

  return (
    <>
      <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] hover:border-[hsl(var(--border-secondary))] transition-all group overflow-hidden">
        <div className="h-32 bg-[hsl(var(--bg-tertiary))] relative overflow-hidden border-b border-[hsl(var(--border-primary))]">
          <OutpostMapPreview outpost={outpost} />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[hsl(var(--bg-secondary))] via-transparent to-transparent opacity-20" />
          <Badge
            variant="outline"
            className="absolute top-3 right-3 z-45 bg-[hsl(var(--bg-secondary))]/90 backdrop-blur border-[hsl(var(--border-primary))] text-xs font-mono text-[hsl(var(--text-secondary))] shadow-sm"
          >
            {outpost.latitude.toFixed(4)}, {outpost.longitude.toFixed(4)}
          </Badge>
        </div>

        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base text-[hsl(var(--text-primary))]">
                {outpost.name}
              </CardTitle>
              <CardDescription className="text-xs text-[hsl(var(--text-secondary))] mt-1 font-mono">
                ID: {outpost.uuid.substring(0, 8)}...
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] -mr-2"
                >
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[hsl(var(--bg-tertiary))] border-[hsl(var(--border-primary))] text-[hsl(var(--text-primary))]"
              >
                <DropdownMenuItem asChild className="focus:bg-[#282e39] cursor-pointer">
                  <Link
                    to={`/outposts/${outpost.uuid}`}
                    className="flex items-center w-full"
                    onClick={handleVisit}
                  >
                    <ExternalLink size={14} className="mr-2" /> Open Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-[#282e39] cursor-pointer">
                  <Link to={`/outposts/${outpost.uuid}/edit`} className="flex items-center w-full">
                    <Edit2 size={14} className="mr-2" /> Edit Geofence
                  </Link>
                </DropdownMenuItem>
                <div className="h-px bg-[#282e39] my-1" />
                <DropdownMenuItem
                  onClick={handleDecommissionClick}
                  className="focus:bg-[#282e39] text-red-400 cursor-pointer"
                >
                  <Trash2 size={14} className="mr-2" /> Decommission
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-[hsl(var(--bg-tertiary))] rounded px-3 py-2 border border-[hsl(var(--border-primary))]">
              <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase">Vertices</p>
              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                {outpost.area?.points?.length || 0}
              </p>
            </div>
            <div className="bg-[hsl(var(--bg-tertiary))] rounded px-3 py-2 border border-[hsl(var(--border-primary))]">
              <p className="text-[10px] text-[hsl(var(--text-secondary))] uppercase">Created At</p>
              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                {new Date(outpost.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[hsl(var(--border-primary))] flex items-center justify-between text-xs text-[hsl(var(--text-secondary))]">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Active
            </span>
            <span className="flex items-center gap-1.5" title="Last visited time">
              <Clock size={12} />
              {lastVisited == 'Never visited' ? 'Never visited' : 'Visited ' + lastVisited}
            </span>
          </div>
        </CardContent>
      </Card>

      <OutpostDecommissionDialog
        open={isDecommissionDialogOpen}
        onOpenChange={setIsDecommissionDialogOpen}
        outpost={outpost}
        input={decommissionInput}
        setInput={setDecommissionInput}
        error={decommissionError}
        onConfirm={confirmDecommission}
      />
    </>
  );
}
