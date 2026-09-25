"use client";
import { motion } from "framer-motion";

// Re-mounts on every navigation: a lightweight, React-safe page transition (used instead of Barba.js).
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
