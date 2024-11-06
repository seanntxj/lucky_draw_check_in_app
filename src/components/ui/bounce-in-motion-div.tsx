import { motion } from "framer-motion";

const BounceInMotionDiv = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 333,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default BounceInMotionDiv;
