
"use client";
import { useState, useEffect, useRef } from "react";
import { PlusCircle, Loader2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

// ------------------ ZOD VALIDATION ------------------
const ticketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
  attachments: z.array(z.string()).optional(),
});

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const fileRef = useRef();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    priority: "Low",
    file: null,
  });

  // Store UI error messages
  const [errors, setErrors] = useState({ title: "", description: "" });

  // ================= FETCH TICKETS =================
  async function fetchTickets() {
    const query = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(status && { status }),
      ...(priority && { priority }),
    });

    const res = await fetch(`/api/tickets?${query.toString()}`);
    const data = await res.json();

    setTickets(data.tickets || []);
    setTotalPages(data.totalPages || 1);
  }

  useEffect(() => { fetchTickets(); }, [page, status, priority, search]);



  // ================= SEARCH =================
  const handleSearch = () => { setPage(1); fetchTickets(); };

  const handleClear = () => {
  setSearch("");
  setStatus("");
  setPriority("");
  setPage(1);

   
};


  // ================= INPUT VALIDATION LIVE =================
  const validateField = (name, value) => {
    const fieldSchema = ticketSchema.shape[name];
    if (!fieldSchema) return;

    const result = fieldSchema.safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [name]: result.success ? "" : result.error.issues[0].message,
    }));
  };


  // ================= CREATE TICKET =================
  async function createTicket(e) {
    e.preventDefault();
    const valid = ticketSchema.safeParse(form);
    if (!valid.success) return toast.error("Fix validation errors first.");

    setLoading(true);

    try {
      let uploadedUrl = null;

      if (form.file) {
        const fd = new FormData();
        fd.append("file", form.file);

        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const file = await uploadRes.json();
        uploadedUrl = file.url;
      }

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          priority: form.priority,
          attachments: uploadedUrl ? [uploadedUrl] : []
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("🎉 Ticket created successfully!");
      setForm({ title: "", description: "", category: "General", priority: "Low", file: null });
      if (fileRef.current) fileRef.current.value = "";
      fetchTickets();

    } catch (err) {
      toast.error(err.message || "Failed to create ticket");
    }

    setLoading(false);
  }


  return (
  <div className="min-h-screen bg-[#0b0d11] text-white px-6 md:px-12 pt-24 pb-12">

    <div className="mb-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent ">
        🎫 My Tickets
      </h1>
      <p className="text-gray-400 ">Create & manage support tickets easily.</p>
    </div>



      {/* ----------------- SEARCH & FILTER BAR ----------------- */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          placeholder="Search tickets..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          onKeyDown={(e)=> e.key==="Enter" && handleSearch()}
          className="inputField w-56"
        />

        <select className="inputField" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
          <option value="">All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>

        <select className="inputField" value={priority} onChange={e=>{setPriority(e.target.value);setPage(1);}}>
          <option value="">All Priority</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Urgent</option>
        </select>

        <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
          Search
        </button>

        {/* 🔥 NEW Clear Button */}
        <button onClick={handleClear} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
          Clear Filters
        </button>
      </div>



      <div className="grid md:grid-cols-2 gap-10">

        {/* ================= CREATE TICKET FORM ================= */}
        <form onSubmit={createTicket} className="bg-white/5 p-7 rounded-2xl backdrop-blur-xl space-y-5 border border-white/10">

          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <PlusCircle size={22} className="text-blue-400" /> Create Ticket
          </h2>

          <input
            className="inputField"
            placeholder="Title"
            value={form.title}
            onChange={(e)=>{setForm({...form,title:e.target.value}); validateField("title",e.target.value);}}
          />
          {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}

          <textarea
            className="inputField h-28"
            placeholder="Describe your issue..."
            value={form.description}
            onChange={(e)=>{setForm({...form,description:e.target.value}); validateField("description", e.target.value);}}
          />
          {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}

          <div className="flex gap-3">
            <select className="inputField flex-1" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              {["General","Billing","Technical","Account","Other"].map(c=> <option key={c}>{c}</option>)}
            </select>
            <select className="inputField flex-1" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
              {["Low","Medium","High","Urgent"].map(p=> <option key={p}>{p}</option>)}
            </select>
          </div>


          {/* FILE INPUT with ❌ REMOVE BUTTON */}
          <div className="relative">
            <input
              ref={fileRef}
              type="file"
              className="inputField pr-10"
              onChange={e=>setForm({...form,file:e.target.files[0]})}
            />
            {form.file && (
              <XCircle
                size={22}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 cursor-pointer hover:text-red-500"
                onClick={()=>{
                  setForm({...form,file:null});
                  fileRef.current.value="";
                }}
              />
            )}
          </div>


          <button disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex justify-center items-center gap-2 disabled:opacity-60">
            {loading && <Loader2 size={18} className="animate-spin"/>}
            {loading ? "Creating..." : "Create Ticket"}
          </button>
        </form>




        {/* ================= TICKET LIST ================= */}
        <div className="bg-white/5 p-7 rounded-2xl backdrop-blur-xl border border-white/10">
          <h2 className="text-2xl font-semibold mb-5">Your Tickets</h2>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">

            {tickets.map(t => (
              <div key={t._id} onClick={()=>window.location.href=`/tickets/${t._id}`} className="ticketCard cursor-pointer">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-lg">{t.title}</h3>
                  <span className={`statusTag ${
                    t.priority==="Urgent"?"bg-red-600":
                    t.priority==="High"?"bg-orange-500":
                    t.priority==="Medium"?"bg-yellow-500":"bg-green-600"
                  }`}>{t.priority}</span>
                </div>
                <p className="text-gray-300 text-sm">{t.category}</p>

                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{t.status}</span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {tickets.length === 0 && <p className="text-gray-400 text-center mt-6">No tickets found</p>}
          </div>


          {/* Pagination */}
          <div className="flex justify-center gap-4 mt-5">
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-5 py-2 bg-gray-700 rounded disabled:opacity-30">Prev</button>
            <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-5 py-2 bg-gray-700 rounded disabled:opacity-30">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

