"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { PlusCircle, Loader2, XCircle, Search, Filter, ChevronLeft, ChevronRight, Download, Eye, MessageSquare, Clock, CheckCircle, AlertCircle, Bell, SortAsc, SortDesc, FileText, Tag, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import TicketsPageSkeleton from "@/components/skeletons/TicketsPageSkeleton";
/* ================= ZOD VALIDATION ================= */
const ticketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
  attachments: z.array(z.string()).optional(),
});

export default function TicketsPage() {

  /* ================= STATES ================= */
  const [tickets, setTickets] = useState([]);
  const [creating, setCreating] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const fileRef = useRef();
  const [showFilters, setShowFilters] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    priority: "Low",
    file: null,
  });

  const [errors, setErrors] = useState({ title: "", description: "" });

  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);


  /* ================= FETCH TICKETS ================= */
  async function fetchTickets() {
  setLoading(true);

  const query = new URLSearchParams({
    page, limit,
    ...(search && { search }),
    ...(status && { status }),
    ...(priority && { priority }),
  });

  const res = await fetch(`/api/tickets?${query}`);
  const data = await res.json();

  setTickets(data.tickets || []);
  setTotalPages(data.totalPages || 1);

  // setStats({
  //   open: data.tickets?.filter(t => t.status === "Open").length || 0,
  //   inProgress: data.tickets?.filter(t => t.status === "In Progress").length || 0,
  //   resolved: data.tickets?.filter(t => t.status === "Resolved").length || 0,
  //   urgent: data.tickets?.filter(t => t.priority === "Urgent").length || 0,
  // });

  setLoading(false);
}
async function fetchStats() {
  try {
    const res = await fetch("/api/tickets?limit=1000");
    const data = await res.json();

    const all = data.tickets || [];

    setStats({
      open: all.filter(t => t.status === "Open").length,
      inProgress: all.filter(t => t.status === "In Progress").length,
      resolved: all.filter(t => t.status === "Resolved").length,
      urgent: all.filter(t => t.priority === "Urgent").length,
    });
  } catch (err) {
    console.error("Stats fetch error", err);
  }
}
useEffect(() => {
  fetchStats();
}, []);
  useEffect(() => { fetchTickets(); }, [page, status, priority, search]);


  /* ================= SORT ================= */
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      let A = a[sortBy], B = b[sortBy];
      if (sortBy === "createdAt") { A = new Date(A); B = new Date(B); }
      return sortOrder === "asc" ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
    });
  }, [tickets, sortOrder, sortBy]);


  /* ================= CREATE ================= */
  async function createTicket(e) {
    e.preventDefault();
    const valid = ticketSchema.safeParse(form);
    if (!valid.success) return toast.error("Fix validation errors first!");

    setCreating(true);
    try {
      let uploadedUrl = null;

      if (form.file) {
        const fd = new FormData();
        fd.append("file", form.file);
        const upload = await fetch("/api/upload", { method:"POST", body:fd });
        const file = await upload.json();
        uploadedUrl = file.url;
      }

      const res = await fetch("/api/tickets", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ ...form, attachments: uploadedUrl ? [uploadedUrl] : [] })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Ticket created successfully!");
      setForm({ title:"", description:"", category:"General", priority:"Low", file:null });
      if(fileRef.current) fileRef.current.value="";

      await fetchTickets();
fetchStats();
    } catch (e) { toast.error(e.message); }
    setCreating(false);
  }


  /* ================= REMOVE SELECTED FILE ================= */
  const removeFile = () => {
    setForm({ ...form, file: null });
    if (fileRef.current) fileRef.current.value = "";
  };


  /* ================= PRIORITY COLOR ================= */
  const getPriorityColor = (p) =>
    p==="Urgent" ? "bg-red-500/20 text-red-400 border-red-500/50" :
    p==="High"   ? "bg-orange-500/20 text-orange-400 border-orange-500/50" :
    p==="Medium" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
                  "bg-green-500/20 text-green-400 border-green-500/50";
/* ================= CSV DOWNLOAD ================= */
const downloadTickets = () => {
  const rows = [
    ["ID", "Title", "Status", "Priority", "Category", "Created At"],
    ...tickets.map(t => [
      t._id,
      `"${t.title}"`,
      t.status,
      t.priority,
      t.category,
      new Date(t.createdAt).toLocaleString()
    ])
  ];

  const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `tickets-${new Date().toISOString().split("T")[0]}.csv`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("CSV Exported Successfully!");
};

if (loading) {
  return <TicketsPageSkeleton />;
}

/* ========================================================================== UI ========================================================================== */

return (
  <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] to-black text-white px-6 md:px-10 pt-28 pb-16">

    {/* HEADER */}
    <header className="bg-[#0D1117]/70 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl mb-10 shadow-xl flex justify-between items-center flex-wrap gap-5">
      <div>
        <h1 className="text-3xl font-extrabold">🎫 Support Dashboard</h1>
        <p className="text-gray-400 text-sm">Manage & track all support tickets efficiently</p>
      </div>

      <div className="flex gap-3">
        <button onClick={downloadTickets} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex gap-2 items-center">
          <Download size={16}/> Export CSV
        </button>
      </div>
    </header>

    {/* ===================== STATS CARDS ===================== */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-700/40 to-blue-900 border border-blue-800 shadow-lg">
        <p className="text-gray-200 text-sm">Open Tickets</p>
        <p className="text-3xl font-bold mt-2 text-white">{stats.open}</p>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-600/40 to-yellow-900 border border-yellow-800 shadow-lg">
        <p className="text-gray-200 text-sm">In Progress</p>
        <p className="text-3xl font-bold mt-2">{stats.inProgress}</p>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-600/40 to-green-900 border border-green-800 shadow-lg">
        <p className="text-gray-200 text-sm">Resolved</p>
        <p className="text-3xl font-bold mt-2 text-green-300">{stats.resolved}</p>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600/40 to-red-900 border border-red-800 shadow-lg">
        <p className="text-gray-200 text-sm">Urgent</p>
        <p className="text-3xl font-bold mt-2 text-red-300">{stats.urgent}</p>
      </div>
    </div>

    {/* ===================== LAYOUT SWAP ===================== */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

      {/* ================= LEFT: CREATE TICKET ================= */}
      <div className="lg:col-span-1 space-y-6">

        <div className="bg-gray-900/70 border border-gray-800 p-6 rounded-2xl sticky top-28 shadow-xl">
          <h2 className="text-lg font-bold flex items-center gap-2"><PlusCircle className="text-green-400"/> Create Ticket</h2>
          <p className="text-gray-400 text-sm mb-5">Submit a new support request</p>

          <form onSubmit={createTicket} className="space-y-5">

            {/* Title */}
            <input placeholder="Title" value={form.title}
              onChange={(e)=>{ setForm({...form,title:e.target.value}); setErrors({...errors,title:e.target.value.length<3?"Title must be at least 3 characters":""}); }}
              className="bg-gray-800 w-full p-3 rounded-xl outline-none"/>
            {errors.title && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.title}</p>}

            {/* Description */}
            <textarea placeholder="Description..." value={form.description}
              onChange={(e)=>{ setForm({...form,description:e.target.value}); setErrors({...errors,description:e.target.value.length<5?"Description must be at least 5 characters":""}); }}
              className="bg-gray-800 w-full p-3 rounded-xl h-28 outline-none"/>
            {errors.description && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errors.description}</p>}

            <div className="grid grid-cols-2 gap-4">
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="bg-gray-800 p-3 rounded-xl">
                <option>General</option><option>Billing</option><option>Technical</option><option>Account</option><option>Other</option>
              </select>

              <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className="bg-gray-800 p-3 rounded-xl">
                <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="relative">
              <input ref={fileRef} type="file" className="bg-gray-800 file:bg-gray-700 file:px-3 file:py-1 rounded-xl p-3 w-full"
                onChange={e=>setForm({...form,file:e.target.files[0]})}/>

              {form.file && (
                <button type="button" onClick={removeFile}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-500">
                  <XCircle size={20}/>
                </button>
              )}
            </div>

            <button disabled={creating} className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 flex justify-center gap-2">
              {creating?<Loader2 className="animate-spin"/>:<PlusCircle/>} Create Ticket
            </button>
          </form>
        </div>
      </div>

      {/* ================= RIGHT : RECENT TICKETS ================= */}
      <div className="lg:col-span-2 space-y-6">

        {/* Search */}
        <div className="bg-gray-900/60 p-5 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center gap-3 flex-wrap">

            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-500" size={18}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchTickets()}
                placeholder="Search tickets..." className="pl-10 pr-3 py-3 rounded-xl bg-gray-800 w-full outline-none"/>
            </div>

            <button onClick={()=>setShowFilters(!showFilters)} className="px-4 py-3 rounded-xl bg-gray-800 flex gap-2 items-center"><Filter/> Filters</button>
            <button onClick={fetchTickets} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-medium">Search</button>
            <button onClick={()=>{setSearch("");setPriority("");setStatus("");}} className="px-4 py-3 bg-gray-800 rounded-xl flex gap-2 items-center"><XCircle/> Clear</button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 border-t pt-5 border-gray-800">
              <select className="bg-gray-800 p-3 rounded-xl" value={status} onChange={e=>setStatus(e.target.value)}>
                <option value="">All Status</option><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
              </select>

              <select className="bg-gray-800 p-3 rounded-xl" value={priority} onChange={e=>setPriority(e.target.value)}>
                <option value="">All Priority</option><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
              </select>

              <div className="flex gap-2">
                <select className="bg-gray-800 p-3 rounded-xl flex-1" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                  <option value="createdAt">Created</option><option value="priority">Priority</option><option value="title">Title</option>
                </select>
                <button onClick={()=>setSortOrder(sortOrder==="asc"?"desc":"asc")} className="px-3 bg-gray-800 rounded-xl">
                  {sortOrder==="asc"?<SortAsc/>:<SortDesc/>}
                </button>
              </div>
            </div>
          )}
        </div>

      {/* TABLE FIXED — No duplicate table, no broken nesting */}
<div className="bg-gray-900/60 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
  
  <div className="p-6 border-b border-gray-800">
    <h2 className="text-xl font-semibold flex gap-2 items-center">
      <MessageSquare/> Recent Tickets ({tickets.length})
    </h2>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full table-auto">
      <thead className="text-gray-400 text-sm border-b border-gray-800">
        <tr>
          <th className="p-4 text-left w-[30%]">Ticket</th>
          <th className="p-4 text-left w-[12%]">Status</th>
          <th className="p-4 text-left w-[12%]">Priority</th>
          <th className="p-4 text-left w-[23%]">Category</th>
          <th className="p-4 text-left w-[15%]">Created</th>
        </tr>
      </thead>

      <tbody>
        {sortedTickets.map(t => (
          <tr key={t._id}
              className="border-b border-gray-800/40 hover:bg-gray-800/30 transition cursor-pointer"
              onClick={()=>location.href=`/tickets/${t._id}`}>

            {/* TICKET */}
            <td className="p-4">
              <div className="font-medium flex items-center gap-2">
                <FileText size={15} className="text-gray-400"/> {t.title}
              </div>
              
            </td>

            {/* STATUS */}
            <td className="p-4 text-sm">{t.status}</td>

            {/* PRIORITY */}
            <td className="p-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(t.priority)}`}>
                {t.priority}
              </span>
            </td>

            {/* CATEGORY */}
            <td className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <Tag size={14} className="text-gray-500"/> {t.category}
              </div>
            </td>

            {/* CREATED */}
            <td className="p-4 whitespace-nowrap text-sm flex items-center gap-2">
              <Calendar size={14} className="text-gray-500"/>
              {new Date(t.createdAt).toLocaleDateString()}
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>




          {/* Pagination */}
          <div className="p-5 flex justify-between border-t border-gray-800 text-gray-300">
            <p>Page {page} of {totalPages}</p>
            <div className="flex gap-3">
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-4 py-2 rounded-lg bg-gray-800 disabled:opacity-30 flex gap-2">
                <ChevronLeft/> Prev
              </button>
              <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 rounded-lg bg-gray-800 disabled:opacity-30 flex gap-2">
                Next <ChevronRight/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
