
"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, User, LogOut, Settings, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBar() {

  const pathname = usePathname();
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [user, setUser] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const HIDE_NAV = ["/", "/login", "/register"];
  const hideNavbar = HIDE_NAV.includes(pathname);

  /* ================= Load User + Notifications ================= */
  useEffect(() => {
    if (!hideNavbar) {
      loadUser();
      loadNotifications();

      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [hideNavbar]);

  async function loadUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
  }

  async function loadNotifications() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications || []);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const unread = notifications.filter(n => !n.read).length;

  /* Outside click to close */
  useEffect(() => {
    function clickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpenProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  /* Esc close */
  useEffect(() => {
    function esc(e) {
      if (e.key === "Escape") {
        setOpenNotif(false);
        setOpenProfile(false);
      }
    }
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  function redirectHome() {
    if (!user) return router.push("/login");
    if (user.role === "admin") return router.push("/admin/dashboard");
    if (user.role === "agent") return router.push("/agent/dashboard");
    return router.push("/tickets");
  }

  if (hideNavbar) return null;

  return (
    <nav className="fixed top-0 w-full z-50 px-8 py-4 flex justify-between items-center 
      backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-lg select-none">

      {/* Logo */}
      <div
        onClick={redirectHome}
        className="flex items-center gap-2 font-bold text-white text-xl cursor-pointer hover:text-blue-400 transition"
      >
        <Ticket size={22}/> Ticket Hub
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-8 text-gray-200">

        {/* ADMIN + AGENT Navigation */}
        {user?.role === "admin" && <a href="/admin/dashboard" className="hover:text-blue-400">Admin Panel</a>}
        {user?.role === "agent" && <a href="/agent/dashboard" className="hover:text-blue-400">Agent Panel</a>}
        
        {/* CUSTOMER Navigation (NO profile option here, it will appear in dropdown) */}
        {user?.role === "customer" && (
          <a href="/tickets" className="hover:text-blue-400">My Tickets</a>
        )}

        {/* ================= Notifications ================= */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setOpenNotif(v => !v); setOpenProfile(false); }}
            className="hover:text-blue-400 relative"
          >
            <Bell size={22}/>
            {unread > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-xs px-1 rounded-full">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {openNotif && (
              <motion.div
                initial={{ opacity:0, y:-10 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-10 }}
                className="absolute right-0 mt-3 w-80 bg-white/10 backdrop-blur-xl p-4 rounded-xl shadow-xl text-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-white">Notifications</h3>

                  {unread > 0 && (
                    <button
                      onClick={async () => {
                        await fetch("/api/notifications", { method:"POST" });
                        setNotifications(prev => prev.map(n => ({ ...n, read:true })));
                      }}
                      className="text-xs text-blue-300 hover:text-blue-400 underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 && (
                    <p className="text-gray-300 text-xs">No notifications</p>
                  )}

                  {notifications.map(n => (
                    <div
                      key={n._id}
                      onClick={async () => {
                        await fetch(`/api/notifications/read/${n._id}`, { method:"PATCH" });
                        setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read:true } : x));
                        router.push(n.link || "/notifications");
                      }}
                      className={`p-2 rounded cursor-pointer transition
                        ${n.read ? "bg-white/5 text-gray-300" : "bg-blue-600/20 text-white font-medium"}
                        hover:bg-white/20`}
                    >
                      <p>{n.message}</p>
                      <span className="text-[10px] opacity-70">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* <button
                  onClick={() => router.push("/notifications")}
                  className="mt-3 w-full text-center text-xs text-blue-300 hover:text-blue-400"
                >
                  View All →
                </button> */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setOpenProfile(v=>!v); setOpenNotif(false); }}
            className="hover:text-blue-400"
          >
            <User size={22}/>
          </button>

          <AnimatePresence>
            {openProfile && (
              <motion.div
                initial={{ opacity:0, y:-10 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-10 }}
                className="absolute right-0 mt-3 w-56 bg-white/10 backdrop-blur-xl p-4 rounded shadow-xl text-sm"
              >
                <p className="font-semibold">{user?.name}</p>
                <p className="text-gray-300 text-xs mb-3">{user?.email}</p>

                {/* 👇 PROFILE SETTINGS ONLY FOR CUSTOMERS */}
                {user?.role === "customer" && (
                  <button
                    onClick={() => router.push("/profile")}
                    className="block py-2 hover:text-blue-400 flex gap-2 w-full text-left"
                  >
                    <Settings size={16}/> Profile Settings
                  </button>
                )}

                <button
                  onClick={logout}
                  className="block py-2 hover:text-red-400 flex gap-2 w-full text-left"
                >
                  <LogOut size={16}/> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </nav>
  );
}
