

"use client";
import { useEffect, useState, useMemo } from "react";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [backup, setBackup] = useState([]); // store original data for reset
  const [agents, setAgents] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadTickets();
    loadAgents();
  }, []);

  async function loadTickets() {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data.tickets || []);
    setBackup(data.tickets || []); // keep original safe
  }

  async function loadAgents() {
    const res = await fetch("/api/users/agents");
    const data = await res.json();
    setAgents(data.agents || []);
  }

  async function assignAgent(ticketId, agentId) {
    if (!agentId) return;

    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: agentId }),
    });
    if (res.ok) loadTickets();
  }

  /* ================= FILTER + SEARCH — optimized with useMemo ================= */
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.createdBy?.email?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter ? t.status === statusFilter : true;
      const matchPriority = priorityFilter ? t.priority === priorityFilter : true;

      const ticketDate = new Date(t.createdAt);
      const matchFrom = dateFrom ? ticketDate >= new Date(dateFrom) : true;
      const matchTo = dateTo ? ticketDate <= new Date(dateTo) : true;

      return matchSearch && matchStatus && matchPriority && matchFrom && matchTo;
    });
  }, [tickets, search, statusFilter, priorityFilter, dateFrom, dateTo]);

  /* ================= CLEAR FILTER ================= */
  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setDateFrom("");
    setDateTo("");
    setTickets(backup); // reset original list instantly
  }

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white p-10 pt-24">

      <h1 className="text-4xl font-bold mb-10">📁 Admin Ticket Control Center</h1>

      {/* ================= FILTERS ================= */}
      <div className="bg-[#14181e] p-5 rounded-xl border border-[#333] grid md:grid-cols-5 gap-4 mb-8 items-center">

        <input
          value={search}
          placeholder="🔍 Search title or email..."
          className="bg-[#1d232b] p-3 rounded outline-none w-full"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="bg-[#1d232b] p-3 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>

        <select className="bg-[#1d232b] p-3 rounded"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Urgent</option>
        </select>

        <div className="flex gap-2">
          <input type="date" className="bg-[#1d232b] p-3 rounded w-1/2"
            value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
          <input type="date" className="bg-[#1d232b] p-3 rounded w-1/2"
            value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        </div>

        {/* CLEAR FILTER BUTTON */}
        {(search || statusFilter || priorityFilter || dateFrom || dateTo) && (
          <button
            onClick={clearFilters}
            className="text-red-400 underline hover:text-red-300"
          >
            Clear Filters ✖
          </button>
        )}

      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full bg-[#14181e] rounded-xl border border-[#333]">
          <thead className="bg-[#1d232b] text-gray-300">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3">User</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Agent</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => (
                <tr key={t._id} className="border-t border-[#333] hover:bg-[#1d232b] text-center">

                  <td className="p-3 text-left">{t.title}</td>
                  <td className="p-3">{t.createdBy?.email}</td>

                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      t.priority === "Urgent" ? "bg-red-600" :
                      t.priority === "High" ? "bg-orange-500" :
                      t.priority === "Medium" ? "bg-yellow-500" : "bg-green-600"
                    }`}>
                      {t.priority}
                    </span>
                  </td>

                  <td className="p-3">{t.status}</td>

                  <td className="p-3">
                    <select
                      onChange={(e) => assignAgent(t._id, e.target.value)}
                      className="bg-[#1d232b] p-2 rounded"
                      defaultValue={t.assignedTo?._id || ""}>
                      <option value="">Select Agent</option>
                      {agents.map((a) => (
                        <option key={a._id} value={a._id}>{a.name}</option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => (window.location.href = `/tickets/${t._id}`)}
                      className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                    >
                      View
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-gray-400 text-center">
                  No tickets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
