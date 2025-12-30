"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { z } from "zod";

// Schema
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    const field = loginSchema.shape[name];
    const res = field.safeParse(value);
    setErrors((prev) => ({ ...prev, [name]: res.success ? "" : res.error.issues[0].message }));
  };

  async function handleLogin(e) {
    e.preventDefault();

    const valid = loginSchema.safeParse(form);
    if (!valid.success) return;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setMsg(data.message);

    if (!res.ok) return;

    const role = data?.user?.role;
    if (role === "admin") router.replace("/admin/dashboard");
    else if (role === "agent") router.replace("/agent/dashboard");
    else router.replace("/tickets");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden text-white 
    bg-gradient-to-br from-[#081221] via-[#0d1b2a] to-[#112240]">

      {/* SAME BACKGROUND BLOBS AS LANDING PAGE */}
      <motion.div
        initial={{ opacity: 0.6, scale: 1 }}
        animate={{ opacity: 1, scale: 1.4 }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "reverse" }}
        className="absolute w-[650px] h-[650px] bg-blue-500/50 blur-[220px] rounded-full -top-40 -left-40 pointer-events-none"
      />
      
      <motion.div
        initial={{ opacity: 0.6, scale: 1 }}
        animate={{ opacity: 1, scale: 1.4 }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "reverse", delay: 2 }}
        className="absolute w-[650px] h-[650px] bg-green-500/50 blur-[220px] rounded-full -bottom-40 -right-40 pointer-events-none"
      />

      {/* LOGIN CARD (LOW EFFECT AS REQUESTED) */}
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-[90%] bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/10 
        shadow-[0_0_25px_rgba(0,0,0,0.5)] space-y-6"
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          Login
        </h2>

        {/* EMAIL */}
        <div>
          <div className="flex items-center gap-3 bg-white/10 rounded-md px-3 py-2 focus-within:ring-2 ring-blue-400">
            <Mail size={18} className="text-gray-300" />
            <input 
              name="email" 
              value={form.email} 
              onChange={handleChange}
              placeholder="Email address"
              className="w-full bg-transparent outline-none text-white placeholder-gray-400"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* PASSWORD */}
        <div>
          <div className="flex items-center gap-3 bg-white/10 rounded-md px-3 py-2 focus-within:ring-2 ring-blue-400">
            <Lock size={18} className="text-gray-300" />
            <input 
              type="password" 
              name="password" 
              value={form.password} 
              onChange={handleChange}
              placeholder="Password"
              className="w-full bg-transparent outline-none text-white placeholder-gray-400"
            />
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
        >
          <LogIn size={18}/> Login
        </button>

        {msg && <p className="text-center text-green-400">{msg}</p>}

        <p className="text-center text-gray-300 text-sm">
          Don't have an account?
          <a href="/register" className="text-blue-400 hover:underline pl-1">Register</a>
        </p>
      </motion.form>
    </div>
  );
}

