"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

// Image settles from a slight zoom. Never hidden, so the image is visible immediately.
export default function ImageReveal({ children }: { children: React.ReactNode }) {
  return <motion.div className="fill" initial={{ scale: 1.04 }} animate={{ scale: 1 }} transition={{ duration: 0.9, ease: EASE }}>{children}</motion.div>;
}
