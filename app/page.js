
"use client";

import { motion } from "framer-motion";
import { Ticket, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden flex justify-center items-center 
                    bg-gradient-to-br from-[#050b14] via-[#061627] to-[#082035] text-white">

      {/* Strong & Visible Background Effects */}
      <motion.div
        initial={{ opacity: 0.6, scale: 1, x: -180, y: -180 }}
        animate={{ opacity: 1, scale: 1.5, x: 0, y: 0 }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "reverse" }}
        className="absolute w-[750px] h-[750px] bg-blue-600/60 blur-[250px] rounded-full -top-64 -left-64 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0.6, scale: 1, x: 180, y: 180 }}
        animate={{ opacity: 1, scale: 1.5, x: 0, y: 0 }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "reverse", delay: 2 }}
        className="absolute w-[750px] h-[750px] bg-green-500/60 blur-[250px] rounded-full -bottom-64 -right-64 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0.4, scale: 1 }}
        animate={{ opacity: 0.7, scale: 1.3 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", delay: 4 }}
        className="absolute w-[850px] h-[850px] bg-blue-300/40 blur-[300px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />

      {/* Floating Glass Card (Effect Reduced / Cleaner UI) */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .8 }}
        className="relative z-10 p-10 rounded-2xl bg-white/8 backdrop-blur-md border border-white/15 
                   shadow-[0_0_20px_rgba(0,0,0,0.3)] max-w-lg w-[90%] text-center animate-floating"
      >
        <motion.div
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="flex justify-center mb-4"
        >
          <Ticket size={70} className="text-blue-300" />
        </motion.div>

        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-300 to-green-300 text-transparent bg-clip-text">
          Ticket Management System
        </h1>

        <p className="text-gray-200 mt-2 text-sm">
          Submit, track & manage support tickets effortlessly ⚡
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <a href="/login" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2 transition-all hover:-translate-y-1">
            <LogIn size={18} /> Login
          </a>

          <a href="/register" className="px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center gap-2 transition-all hover:-translate-y-1">
            <UserPlus size={18} /> Register
          </a>
        </div>
      </motion.div>

      <style>
        {`
        .animate-floating {
          animation: floating 4.5s ease-in-out infinite;
        }
        @keyframes floating {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.03); }
          100% { transform: translateY(0) scale(1); }
        }
        `}
      </style>
    </div>
  );
}
