"use client";
import { useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";

const authRegisterSchema = z.object({
  name: z.string().min(2, "Full name should have at least 2 characters"),
  email: z.string().email("Enter a valid email e.g. johndoe@gmail.com"),
  password: z.string().min(6, "Password must be minimum 6 characters"),
});

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    const fieldSchema = authRegisterSchema.shape[name];
    const result = fieldSchema.safeParse(value);

    setErrors((prev) => ({
      ...prev,
      [name]: result.success ? "" : result.error.issues[0].message,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const valid = authRegisterSchema.safeParse(form);
    if (!valid.success) return;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    

    if (res.ok) window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden text-white 
    bg-gradient-to-br from-[#081221] via-[#0d1b2a] to-[#112240]">

      {/* SAME BACKGROUND EFFECT AS LANDING + LOGIN */}
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

      {/* REGISTER CARD (Minimal glow same as login) */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-[90%] max-w-md bg-white/10 backdrop-blur-md p-8 rounded-xl 
        border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.5)] space-y-5"
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-green-400 text-transparent bg-clip-text">
          Create Account
        </h2>
        <p className="text-gray-300 text-center text-sm">Sign up to continue</p>

        {/* NAME INPUT */}
        <input
          name="name"
          placeholder="Full Name"
          className="w-full p-3 rounded-lg bg-white/10 text-white outline-none 
                    placeholder-gray-400 focus:ring-2 ring-blue-400"
          onChange={handleChange}
        />
        {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}

        {/* EMAIL INPUT */}
        <input
          name="email"
          placeholder="Email Address"
          className="w-full p-3 rounded-lg bg-white/10 text-white outline-none 
                    placeholder-gray-400 focus:ring-2 ring-blue-400"
          onChange={handleChange}
        />
        {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}

        {/* PASSWORD INPUT */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg bg-white/10 text-white outline-none 
                    placeholder-gray-400 focus:ring-2 ring-blue-400"
          onChange={handleChange}
        />
        {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}

        {/* BUTTON */}
        <button className="bg-blue-600 hover:bg-blue-700 w-full py-3 rounded-lg font-semibold transition">
          Register
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-gray-300 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline font-medium">Login</a>
        </p>
      </motion.form>
    </div>
  );
}
