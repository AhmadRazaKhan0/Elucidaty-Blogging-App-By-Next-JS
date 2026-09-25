"use client";
import { motion } from "framer-motion";
import { DURATION, EASE, OFFSET } from "@/lib/motion";

export default function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: OFFSET }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DURATION, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
}
