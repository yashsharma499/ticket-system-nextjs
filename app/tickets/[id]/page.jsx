
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";   // <-- using react-hot-toast

export default function TicketDetailsPage() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const [agents, setAgents] = useState([]);
  const [message, setMessage] = useState("");

  // AI States
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchTicket();
    fetchAgents();
  }, []);

  async function fetchUser() {
    const res = await fetch("/api/auth/me");
    setCurrentUser((await res.json()).user);
  }

  async function fetchTicket() {
    const res = await fetch(`/api/tickets/${id}`);
    const data = await res.json();
    setTicket(data.ticket);
    setStatus(data.ticket.status);
    setPriority(data.ticket.priority);
  }

  async function fetchAgents() {
    const res = await fetch("/api/users/agents");
    setAgents((await res.json()).agents || []);
  }

  // --------------------------------------------------------------------
  // UPDATE TICKET (Toast)
  // --------------------------------------------------------------------
  async function updateTicket(extra = {}) {
    if (updating) return;          // prevent double click
  setUpdating(true);
    const payload = { status, priority, ...extra };
    if (status === "Resolved") payload.resolvedAt = new Date();

    const res = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setMessage(data.message);

    if (res.ok) {
      toast.success("Ticket Updated Successfully");
      fetchTicket();
    } else toast.error(data.message || "Update Failed");
  }

 
  async function addComment() {
    let uploadedFile = null;

    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      const upload = await fetch("/api/upload", { method: "POST", body: fd });
      uploadedFile = (await upload.json()).url;
    }

    const res = await fetch(`/api/tickets/${id}/comment`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ message: comment, attachment: uploadedFile }),
    });

    const data = await res.json();
    setMessage(data.message);

    if(res.ok){
      toast.success("Comment Added");
      setComment(""); setFile(null); fetchTicket();
    } else toast.error("Failed to Add Comment");
  }

  // --------------------------------------------------------------------
  // AI SUMMARY (Toast)
  // --------------------------------------------------------------------
  async function summarizeTicket(){
    setAiLoading(true);
    toast.loading("Summarizing...", { id:"ai-load" });

    const res = await fetch("/api/ai/summarize",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ text: ticket.description })
    });

    const data = await res.json();
    setAiSummary(data.summary || "AI Disabled — Summary unavailable");
    setAiLoading(false);

    toast.success("AI Summary Ready!", { id:"ai-load" });
    window.scrollTo({ top: 0, behavior:"smooth" });
  }

  // --------------------------------------------------------------------
  // AI SUGGEST REPLY (Toast)
  // --------------------------------------------------------------------
  async function suggestReply(){
    setAiLoading(true);
    toast.loading("Generating reply...", { id:"ai-reply" });

    const res = await fetch("/api/ai/reply",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ text: ticket.description })
    });

    const data = await res.json();
    setComment(data.reply || "Thanks! We'll resolve it shortly.");
    setAiLoading(false);

    toast.success("Reply Suggested", { id:"ai-reply" });
  }

  // --------------------------------------------------------------------

  if (!ticket || !currentUser) return <p className="text-gray-300 p-10">Loading...</p>;

  const isAdmin = currentUser.role === "admin";
  const isAgent = currentUser.role === "agent";
  const isCustomer = currentUser.role === "customer";

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white px-8 pt-28 pb-16 space-y-10">

      {/* Ticket Header */}
      <div className="bg-[#14181e] p-6 rounded-xl border border-[#333] shadow-xl relative">
        <h1 className="text-3xl font-bold">{ticket.title}</h1>
        <p className="text-gray-300 mt-2">{ticket.description}</p>

        {/* AI Summary Block */}
        {aiSummary && (
          <div className="bg-[#0c1116] mt-4 p-4 rounded border border-[#333]">
            <p className="text-sm text-blue-400 font-semibold mb-1">AI Summary:</p>
            <p className="text-gray-300 text-sm leading-relaxed">{aiSummary}</p>
          </div>
        )}

        {(isAdmin || isAgent) && (
          <button disabled={aiLoading} onClick={summarizeTicket}
            className="absolute top-6 right-6 bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm disabled:bg-gray-600">
            {aiLoading ? "Summarizing..." : "🧠 Summarize"}
          </button>
        )}

        {/* Meta */}
        <div className="mt-4 text-sm space-y-1">
          <p><b>Status:</b> {ticket.status}</p>
          <p><b>Priority:</b> {ticket.priority}</p>
          <p><b>Category:</b> {ticket.category}</p>
          <p><b>Created:</b> {new Date(ticket.createdAt).toLocaleString()}</p>
          <p><b>Assigned:</b> {ticket.assignedTo?.name || "Not Assigned"}</p>
        </div>
      </div>

      {/* Ticket Management */}
      {(isAdmin||isAgent)&&(
        <div className="bg-[#14181e] p-6 rounded-xl border border-[#333] shadow-xl max-w-xl space-y-4">
          <h2 className="text-xl font-bold">Manage Ticket</h2>

          <select className="w-full p-3 bg-[#1d232b] rounded-lg"
            value={status} onChange={e=>setStatus(e.target.value)}>
            <option>Open</option><option>In Progress</option>
            <option>Resolved</option><option>Closed</option>
          </select>

          <select className="w-full p-3 bg-[#1d232b] rounded-lg"
            value={priority} onChange={e=>setPriority(e.target.value)}>
            <option>Low</option><option>Medium</option>
            <option>High</option><option>Urgent</option>
          </select>

          {isAdmin && (
            <select className="w-full p-3 bg-[#1d232b] rounded-lg"
              onChange={e=>updateTicket({ assignedTo:e.target.value })}>
              <option>Select Agent</option>
              {agents.map(a=>(<option key={a._id} value={a._id}>{a.name} ({a.email})</option>))}
            </select>
          )}

          <button onClick={()=>updateTicket()}
            className="bg-blue-600 w-full py-2 rounded-lg hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      )}

      {/* Comments */}
      <div className="bg-[#14181e] p-6 rounded-xl border border-[#333] shadow-xl">
        <h2 className="text-2xl font-bold mb-4">💬 Comments</h2>

        {ticket.comments?.map((c,i)=>(
          <div key={i} className="p-4 bg-[#0b0d10] rounded border border-[#333] mb-3">
            <p>{c.message}</p>
            {c.attachment && <a href={c.attachment} target="_blank"
              className="text-blue-400 underline block mt-2">📎 View File</a>}
            <p className="text-xs text-gray-400 mt-2">{new Date(c.createdAt).toLocaleString()}</p>
          </div>
        ))}

        {(isAdmin||isAgent)&&(
         <div className="mt-5 flex gap-3 items-center">
  <input
    placeholder="Write comment..."
    className="flex-1 p-3 bg-[#1d232b] rounded-lg outline-none"
    value={comment}
    onChange={e => setComment(e.target.value)}
  />

  {/* AI Reply Button */}
  <button
    disabled={aiLoading || !comment.trim()}    // disable when input empty or loading
    onClick={suggestReply}
    className="bg-purple-600 px-3 py-2 rounded hover:bg-purple-700 disabled:bg-gray-600"
  >
    💡 AI Reply
  </button>

  {/* Send Button */}
  <button
    disabled={!comment.trim() || aiLoading}    
    onClick={addComment}
    className="bg-green-600 px-5 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-600"
  >
    Send
  </button>
</div>
        )}

        {message && <p className="text-green-400 mt-3">{message}</p>}
      </div>
    </div>
  );
}


