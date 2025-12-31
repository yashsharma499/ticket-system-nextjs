
"use client";
import { useEffect, useState } from "react";
import { User, Lock, LogOut, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [sessions, setSessions] = useState([]);

  // Loading states for disabling buttons
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingLogoutAll, setLoadingLogoutAll] = useState(false);

  useEffect(() => {
    loadUser();
    loadSessions();
  }, []);

  async function loadUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
    setName(data.user?.name);
    setEmail(data.user?.email);
  }

  /* ================= UPDATE PROFILE (Prevent toast if no change) ================= */
  async function updateProfile() {
    if (name === user?.name && email === user?.email) {
      toast.error("No changes detected");
      return;
    }

    setLoadingUpdate(true);
    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();

    res.ok ? toast.success(data.message || "Profile Updated")
           : toast.error(data.message || "Update failed");

    if (res.ok) loadUser();
    setLoadingUpdate(false);
  }

  /* ================= CHANGE PASSWORD (Prevent if empty or same) ================= */
  async function changePassword() {
    if (!oldPass || !newPass) {
      toast.error("Enter both old & new password");
      return;
    }

    if (oldPass === newPass) {
      toast.error("New password cannot be same as old");
      return;
    }

    setLoadingPass(true);
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPass, newPass }),
    });

    const data = await res.json();

    res.ok ? toast.success("Password updated successfully")
           : toast.error(data.message || "Incorrect password");

    setOldPass("");
    setNewPass("");
    setLoadingPass(false);
  }

  async function loadSessions() {
    setLoadingSessions(true);
    const res = await fetch("/api/profile/sessions");
    const data = await res.json();
    setSessions(data.sessions || []);
    setLoadingSessions(false);
  }

  async function logoutAll() {
    setLoadingLogoutAll(true);
    const res = await fetch("/api/profile/logout-all", { method: "POST" });
    const data = await res.json();

    res.ok ? toast.success(data.message) : toast.error("Action Failed");
    if (res.ok) setSessions([]);

    setLoadingLogoutAll(false);
  }

  if (!user) return <div className="text-white p-10">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white px-8 pt-28 pb-12 space-y-12">

      <h1 className="text-4xl font-bold">Profile Settings 👤</h1>
      <p className="text-gray-300 mb-4">Manage your account settings & security preferences</p>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">

        {/* ========= Account Details ========= */}
        <div className="bg-gray-800/60 p-6 rounded-xl shadow-xl border border-gray-700 backdrop-blur-xl space-y-5">
          <h2 className="text-xl font-semibold flex items-center gap-2"><User size={20}/> Personal Info</h2>

          <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg outline-none" />
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg outline-none" />

          <button
            onClick={updateProfile}
            disabled={loadingUpdate}
            className={`w-full py-2 rounded-lg font-semibold transition
              ${loadingUpdate ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loadingUpdate ? "Updating..." : "Update Profile"}
          </button>
        </div>

        {/* ========= Change Password ========= */}
        <div className="bg-gray-800/60 p-6 rounded-xl shadow-xl border border-gray-700 backdrop-blur-xl space-y-5">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Lock size={20}/> Password Security</h2>

          <input type="password" value={oldPass} onChange={(e)=>setOldPass(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg outline-none" placeholder="Old Password" />
          <input type="password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg outline-none" placeholder="New Password" />

          <button
            onClick={changePassword}
            disabled={loadingPass}
            className={`w-full py-2 rounded-lg font-semibold transition
              ${loadingPass ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          >
            {loadingPass ? "Changing..." : "Change Password"}
          </button>
        </div>

        {/* ========= Sessions ========= */}
        <div className="bg-gray-800/60 p-6 rounded-xl shadow-xl border border-gray-700 backdrop-blur-xl space-y-5">
          <h2 className="text-xl font-semibold flex items-center gap-2"><RefreshCw size={20}/> Login Sessions</h2>

          <button
            onClick={loadSessions}
            disabled={loadingSessions}
            className={`px-4 py-2 rounded-lg flex items-center gap-2
              ${loadingSessions ? "bg-gray-600 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            {loadingSessions ? "Loading..." : <><RefreshCw size={16}/> Refresh</>}
          </button>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
            {sessions.length ? sessions.map((s,i)=>(
              <div key={i} className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                <p className="text-xs break-all">Token: {s.token?.slice(0,28)}...</p>
                <p className="text-gray-400 text-xs mt-1">{new Date(s.loginAt).toLocaleString()}</p>
              </div>
            )) : <p className="text-gray-400">No active sessions</p>}
          </div>

          <button
            onClick={logoutAll}
            disabled={loadingLogoutAll}
            className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2
              ${loadingLogoutAll ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
          >
            {loadingLogoutAll ? "Logging out..." : <><LogOut size={18}/> Logout All Devices</>}
          </button>

        </div>
      </div>
    </div>
  );
}
