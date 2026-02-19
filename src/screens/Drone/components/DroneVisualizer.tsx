import { Canvas } from '@react-three/fiber';
import { useGLTF, PresentationControls, Html, Environment, Stage } from '@react-three/drei';
import { Suspense, useMemo, memo } from 'react';
import { Box, Pause } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AVAILABLE_MODELS = ['x500', 'typhoon'];
const DEFAULT_MODEL = 'x500';

// Preload models (moved from top level to here if possible, or keep at module level if used across files, but fine here)
AVAILABLE_MODELS.forEach((model) => useGLTF.preload(`/models/${model}.model.glb`));

const DroneModel = memo(({ model }: { model: string }) => {
  const safeModel = AVAILABLE_MODELS.includes(model) ? model : DEFAULT_MODEL;
  const { scene } = useGLTF(`/models/${safeModel}.model.glb`);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clonedScene} />;
});

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--accent))]"></div>
        <span className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--text-muted))]">
          Loading Asset...
        </span>
      </div>
    </Html>
  );
}

const VisualizerCanvas = memo(({ modelName }: { modelName: string }) => {
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-[hsl(var(--bg-secondary))] to-[hsl(var(--bg-tertiary))] rounded-lg overflow-hidden relative">
      <Canvas
        dpr={[1, 1.5]}
        shadows={false}
        camera={{ fov: 45, position: [0, 0, 5] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={<Loader />}>
          <Environment preset="city" />
          <Stage environment={null} intensity={0.5}>
            <PresentationControls global zoom={0.8} polar={[-0.2, Math.PI / 2]}>
              <DroneModel model={modelName} />
            </PresentationControls>
          </Stage>
        </Suspense>
      </Canvas>

      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-[10px] font-mono text-white/70 pointer-events-none">
        Interactive 3D
      </div>
    </div>
  );
});

interface DroneVisualizerProps {
  modelName: string;
  isConsoleOpen: boolean;
}

export function DroneVisualizer({ modelName, isConsoleOpen }: DroneVisualizerProps) {
  return (
    <Card className="bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border-primary))] overflow-hidden">
      <CardHeader className="py-3 px-4 border-b border-[hsl(var(--border-primary))] flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Box size={16} className="text-[hsl(var(--text-secondary))]" />
          <span className="font-medium text-sm">Digital Twin</span>
        </div>
        <Badge
          variant="secondary"
          className={`font-mono text-[10px] transition-colors duration-300 ${
            isConsoleOpen
              ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
              : 'text-[hsl(var(--text-muted))]'
          }`}
        >
          {isConsoleOpen ? 'SUSPENDED' : 'LIVE RENDER'}
        </Badge>
      </CardHeader>

      <div className="h-[450px] w-full bg-[hsl(var(--bg-tertiary))] relative">
        {isConsoleOpen ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--bg-tertiary))]/60 backdrop-blur-sm z-10 transition-all">
            <div className="relative group cursor-default">
              <div className="absolute -inset-4 bg-[hsl(var(--primary))] rounded-full opacity-0 group-hover:opacity-10 animate-pulse transition-opacity duration-700"></div>

              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-primary))] shadow-xl">
                <Pause
                  size={32}
                  className="text-[hsl(var(--text-secondary))]"
                  fill="currentColor"
                  fillOpacity={0.1}
                />
              </div>
            </div>

            {/* Text Label */}
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <span className="text-xs font-bold tracking-[0.2em] text-[hsl(var(--text-secondary))] uppercase">
                Render Paused
              </span>
              <span className="text-[10px] font-mono text-[hsl(var(--text-muted))]">
                Resources allocated to Terminal
              </span>
            </div>
          </div>
        ) : (
          <VisualizerCanvas modelName={modelName} />
        )}
      </div>
    </Card>
  );
}
