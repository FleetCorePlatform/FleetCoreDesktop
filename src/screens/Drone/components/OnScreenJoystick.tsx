import { motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
  onEnd?: () => void;
  label?: string;
}

export function OnScreenJoystick({ onMove, onEnd, label }: JoystickProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lastCallRef = useRef({ x: 0, y: 0 });

  const notifyMove = (currX: number, currY: number) => {
    const normX = Math.max(-1, Math.min(1, currX / 35));
    const normY = Math.max(-1, Math.min(1, currY / 35));

    if (
      Math.abs(normX - lastCallRef.current.x) > 0.05 ||
      Math.abs(normY - lastCallRef.current.y) > 0.05
    ) {
      onMove(normX, normY);
      lastCallRef.current = { x: normX, y: normY };
    }
  };

  useEffect(() => {
    const unsubscribeX = x.on('change', (val) => notifyMove(val, y.get()));
    const unsubscribeY = y.on('change', (val) => notifyMove(x.get(), val));

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y, onMove]);

  const handleDragEnd = () => {
    x.set(0);
    y.set(0);
    onMove(0, 0);
    lastCallRef.current = { x: 0, y: 0 };
    if (onEnd) onEnd();
  };

  return (
    <div className="relative flex items-center justify-center w-28 h-28 bg-zinc-800/20 rounded-full border border-zinc-700/30 backdrop-blur-sm pointer-events-auto shadow-2xl overflow-visible">
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-px h-full bg-white" />
        <div className="h-px w-full bg-white absolute" />
      </div>
      <motion.div
        drag
        dragConstraints={{ left: -35, right: 35, top: -35, bottom: 35 }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x, y }}
        className="w-12 h-12 bg-zinc-200/10 rounded-full border border-white/20 shadow-xl cursor-grab active:cursor-grabbing flex items-center justify-center z-10"
      >
        <div className="w-5 h-5 bg-zinc-100/30 rounded-full shadow-inner" />
      </motion.div>
      {label && (
        <span className="absolute -bottom-8 text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold bg-black/50 px-2 py-0.5 rounded">
          {label}
        </span>
      )}
    </div>
  );
}
