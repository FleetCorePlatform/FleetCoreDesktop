import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface CreationLoadingProps {
  isSubmitting: boolean;
}

export function CreationLoading({ isSubmitting }: CreationLoadingProps) {
  return (
    <AnimatePresence>
      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white"
        >
          <Loader2 className="h-16 w-16 animate-spin text-[hsl(var(--accent))]" />
          <h2 className="mt-4 text-lg font-mono font-bold tracking-widest animate-pulse">
            ESTABLISHING PERIMETER...
          </h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
