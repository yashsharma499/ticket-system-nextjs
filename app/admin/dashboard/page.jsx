
"use client";
import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [backupStats, setBackupStats] = useState(null); 
  const [filterLoading, setFilterLoading] = useState(false); 
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function fetchStats(applyFilter = false) {
    let url = "/api/admin/stats";
    const params = new URLSearchParams();

    if (from && applyFilter) params.append("from", from);
    if (to && applyFilter) params.append("to", to);

    if (params.toString()) url += `?${params.toString()}`;

    setFilterLoading(true);
    const res = await fetch(url);
    const data = await res.json();

    setTimeout(() => {                 
      setStats(data);
      if (!applyFilter) setBackupStats(data); 
      setFilterLoading(false);
    }, 300); // 300ms smooth update
  }

  // Load initial stats once
  useEffect(() => { fetchStats(false); }, []);

  if (!stats) return <p className="text-white p-20">Loading Dashboard...</p>;

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white p-10 pt-24">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-bold">📊 Admin Dashboard</h1>

        <a href="/admin/tickets"
           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Manage Tickets</a>
      </div>

      {/* DATE FILTER */}
      <div className="bg-[#14181e] p-5 rounded-xl border border-[#333] mb-10 flex flex-wrap gap-4 items-end">
        
        <div>
          <label className="text-sm text-gray-400">From</label>
          <input type="date"
            value={from}
            onChange={(e)=>setFrom(e.target.value)}
            className="bg-[#1d232b] p-2 rounded ml-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">To</label>
          <input type="date"
            value={to}
            onChange={(e)=>setTo(e.target.value)}
            className="bg-[#1d232b] p-2 rounded ml-2"
          />
        </div>

        <button
          onClick={() => fetchStats(true)}
          disabled={filterLoading}
          className={`px-5 py-2 rounded font-semibold transition-all 
                     ${filterLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {filterLoading ? "Filtering..." : "Apply Filter"}
        </button>

        {(from || to) && (
          <button
            onClick={()=>{
              setFrom("");
              setTo("");
              setStats(backupStats); // ⬅ Instant restore without fetching again
            }}
            className="text-red-400 underline ml-2"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12 transition-opacity duration-300">
        <StatCard title="Total Tickets" value={stats.total} />
        <StatCard title="Open" value={stats.statusCount.open} />
        <StatCard title="In Progress" value={stats.statusCount.inProgress} />
        <StatCard title="Resolved" value={stats.statusCount.resolved} />
        <StatCard title="Closed" value={stats.statusCount.closed} />
      </div>

      {/* AVG RESOLUTION */}
      <div className="bg-[#14181e] border border-[#333] p-5 rounded-xl mb-12">
        <p className="text-gray-400 text-sm">Avg Resolution Time</p>
        <h2 className="text-3xl font-bold mt-1">
          {stats.avgResolutionTime ? `${stats.avgResolutionTime} Hrs` : "N/A"}
        </h2>
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-10">

        <ChartBox title="Tickets by Status">
          <Pie data={{
            labels: ["Open", "In Progress", "Resolved", "Closed"],
            datasets: [{
              data: [
                stats.statusCount.open,
                stats.statusCount.inProgress,
                stats.statusCount.resolved,
                stats.statusCount.closed,
              ],
              backgroundColor: ["#3b82f6","#facc15","#22c55e","#ef4444"],
            }]
          }} />
        </ChartBox>

        <ChartBox title="Tickets by Priority">
          <Bar data={{
            labels:["Low","Medium","High","Urgent"],
            datasets:[{
              label:"Tickets",
              data:[
                stats.priorityCount.low,
                stats.priorityCount.medium,
                stats.priorityCount.high,
                stats.priorityCount.urgent,
              ],
              backgroundColor:"#2563eb",
            }]
          }} />
        </ChartBox>

        <ChartBox title="Tickets Per Agent">
          <Bar data={{
            labels: stats.ticketsPerAgent.map(a=>a.name),
            datasets:[{
              label:"Assigned Tickets",
              data: stats.ticketsPerAgent.map(a=>a.count),
              backgroundColor:"#10b981",
            }]
          }} />
        </ChartBox>

      </div>
    </div>
  );
}

/* COMPONENTS */
function StatCard({ title, value }) {
  return(
    <div className="bg-[#14181e] p-6 rounded-xl border border-[#333] text-center hover:scale-105 transition">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="bg-[#14181e] p-6 rounded-2xl shadow-lg border border-[#333]">
      <h2 className="text-xl font-semibold mb-5">{title}</h2>
      {children}
    </div>
  );
}
