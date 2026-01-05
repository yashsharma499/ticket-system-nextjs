

"use client";
import { useEffect, useState } from "react";
import AgentDashboardSkeleton from "@/components/skeletons/AgentDashboardSkeleton";

export default function AgentDashboard() {

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ assigned:0, resolved:0, pending:0 });
  const [loading, setLoading] = useState(true);
  const [aiLoadingId, setAiLoadingId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [summaryModal, setSummaryModal] = useState({ open:false, text:"" });

  async function fetchTickets() {
    setLoading(true);

    const query = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(status && { status }),
      ...(priority && { priority }),
    });

    const res = await fetch(`/api/tickets?${query}`);
    const data = await res.json();

    setTickets(data.tickets || []);

    setStats({
      assigned: data.tickets.length,
      resolved: data.tickets.filter(t => t.status==="Resolved").length,
      pending: data.tickets.filter(t => !["Resolved","Closed"].includes(t.status)).length,
    });

    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }

  useEffect(() => { fetchTickets(); }, [page,status,priority]);

  const handleSearch = () => {
    setPage(1);
    fetchTickets();
  };

  function clearFilters() {
    setSearch("");
    setStatus("");
    setPriority("");
    setPage(1);
    fetchTickets();
  }

  async function handleAISummary(ticket) {
    setAiLoadingId(ticket._id);

    const res = await fetch("/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: ticket.description })
    });

    const data = await res.json();

    setSummaryModal({
      open:true,
      text:data.summary
    });

    setAiLoadingId(null);
  }

  // ✅ Skeleton instead of text loader
  if (loading) return <AgentDashboardSkeleton />;

  return(
    <div className="min-h-screen bg-[#0b0d10] text-white p-10 pt-24">

      <h1 className="text-3xl font-bold mb-6">🎧 Agent Dashboard</h1>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-6 items-center">
        <input placeholder="Search..." value={search} 
          onChange={e=>setSearch(e.target.value)}
          onKeyDown={(e)=> e.key==="Enter" && handleSearch()}
          className="inputField w-52" />

        <select className="inputField" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>

        <select className="inputField" value={priority} onChange={e=>setPriority(e.target.value)}>
          <option value="">All Priority</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Urgent</option>
        </select>

        <button onClick={handleSearch} className="bg-blue-600 px-4 py-2 rounded">Search</button>

        {(search || status || priority) && (
          <button onClick={clearFilters} className="text-red-400 underline text-sm">
            Clear Filters ✖
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Assigned" value={stats.assigned}/>
        <StatCard title="Pending" value={stats.pending}/>
        <StatCard title="Resolved" value={stats.resolved}/>
      </div>

      {/* Table */}
      <div className="bg-[#14181e] p-6 rounded-xl border border-[#333]">
        <h2 className="text-xl font-semibold mb-4">Your Tickets</h2>

        <table className="w-full">
          <thead className="bg-[#1d232b] text-sm">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">AI</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map(t=>(
              <tr key={t._id} className="border-b border-[#333] hover:bg-gray-800">
                <td className="p-3">{t.title}</td>
                <td className="p-3">{t.priority}</td>
                <td className="p-3">{t.status}</td>

                <td className="p-3 text-center">
                  <button 
                    onClick={()=>handleAISummary(t)} 
                    className="bg-blue-600 px-3 py-1 rounded text-xs"
                  >
                    {aiLoadingId===t._id ? "..." : "🧠 Summary"}
                  </button>
                </td>

                <td className="p-3">
                  <button
                    onClick={()=>window.location.href=`/tickets/${t._id}`}
                    className="bg-purple-500 px-3 py-1 rounded text-sm">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center gap-4 mt-5">
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)}
            className="px-5 py-2 bg-gray-700 rounded disabled:opacity-30">
            Prev
          </button>
          <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}
            className="px-5 py-2 bg-gray-700 rounded disabled:opacity-30">
            Next
          </button>
        </div>
      </div>

      {/* AI Modal */}
      {summaryModal.open && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/60 z-50">
          <div className="bg-[#161b22] w-[90%] max-w-md p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-3">🧠 AI Summary</h2>
            <div className="max-h-60 overflow-y-auto">{summaryModal.text}</div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={()=>setSummaryModal({open:false,text:""})}
                className="bg-gray-600 px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({title,value}){
  return(
    <div className="bg-[#14181e] p-6 rounded-xl text-center border border-[#333]">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}
