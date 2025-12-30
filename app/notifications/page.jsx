"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [list, setList] = useState([]);
  const router = useRouter();

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setList(data.notifications || []);
  }

  async function markOne(id, link) {
    await fetch(`/api/notifications/read/${id}`, { method: "PATCH" });
    load(); // Refresh UI
    router.push(link || "/notifications");
  }

  async function markAll() {
    await fetch("/api/notifications", { method: "POST" }); // your POST marks all read
    load();
  }

  return (
    <div className="pt-24 px-6 max-w-3xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>

        {list.some(n => !n.read) && (
          <button
            onClick={markAll}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {list.length === 0 && <p className="text-gray-400">No notifications found.</p>}

        {list.map((n)=>(
          <div
            key={n._id}
            onClick={() => markOne(n._id, n.link)}
            className={`p-4 rounded cursor-pointer border transition 
              ${n.read ? "bg-white/5 border-white/10" : "bg-blue-600/20 border-blue-400/40 font-medium"} 
              hover:bg-white/10`}
          >
            <p>{n.message}</p>
            <span className="text-xs opacity-60">
              {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
