import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface CreationWarningProps {
  locationWarning: string | null;
  setLocationWarning: (warning: string | null) => void;
}

export function CreationWarning({ locationWarning, setLocationWarning }: CreationWarningProps) {
  return (
    <AnimatePresence>
      {locationWarning && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute bottom-24 left-1/2 z-[500] px-4 max-w-md w-full"
        >
          <div className="flex items-start gap-3 p-4 bg-[#0f1115] border-l-4 border-l-amber-500 border-y border-r border-y-[#282e39] border-r-[#282e39] rounded-r-lg shadow-2xl">
            <div className="p-2 bg-amber-500/10 rounded-full shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 pt-0.5">
              <h4 className="text-sm font-bold text-white mb-1">Warning</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{locationWarning}</p>
            </div>
            <button
              onClick={() => setLocationWarning(null)}
              className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-md"
            >
              <span className="sr-only">Dismiss</span>
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
