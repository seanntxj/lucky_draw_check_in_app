/**
 * https://www.hover.dev/components/modals
 */

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

interface SpringModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  children: ReactNode;
}

export const SpringModal: React.FC<SpringModalProps> = ({ isOpen, setIsOpen, children }) => {
  setIsOpen

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-neutral-900 text-white p-10 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden "
          >
            <div className="relative z-10">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
