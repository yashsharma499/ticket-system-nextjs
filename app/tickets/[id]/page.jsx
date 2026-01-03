


"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import TicketDetailsSkeleton from "@/components/skeletons/TicketDetailsSkeleton";

export default function TicketDetailsPage() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");

  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const [agents, setAgents] = useState([]);

  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  /* ================= LOAD DATA ================= */
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
    setSelectedAgent(data.ticket.assignedTo?._id || "");
  }

  async function fetchAgents() {
    const res = await fetch("/api/users/agents");
    setAgents((await res.json()).agents || []);
  }

  /* ================= UPDATE TICKET ================= */
 async function updateTicket() {
  if (updating) return;
  setUpdating(true);

  const payload = {
    status,
    priority,
  };

  // ✅ ONLY ADMIN can send assignedTo
  if (isAdmin && selectedAgent) {
    payload.assignedTo = selectedAgent;
  }

  const res = await fetch(`/api/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    toast.success("Ticket updated successfully");
    fetchTicket();
  } else {
    toast.error("Update failed");
  }

  setUpdating(false);
}

  /* ================= ADD COMMENT ================= */
  async function addComment() {
    let uploadedFile = null;

    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      const upload = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      uploadedFile = (await upload.json()).url;
    }

    const res = await fetch(`/api/tickets/${id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: comment,
        attachment: uploadedFile,
      }),
    });

    if (res.ok) {
      toast.success("Comment added");
      setComment("");
      setFile(null);
      fetchTicket();
    } else {
      toast.error("Failed to add comment");
    }
  }

  /* ================= AI SUMMARY ================= */
  async function summarizeTicket() {
    setAiLoading(true);

    const res = await fetch("/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: ticket.description }),
    });

    const data = await res.json();
    setAiSummary(data.summary || "AI summary unavailable");
    setAiLoading(false);
  }

  /* ================= LOADING ================= */
  if (!ticket || !currentUser) {
    return <TicketDetailsSkeleton />;
  }

  const isAdmin = currentUser.role === "admin";
  const isAgent = currentUser.role === "agent";

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white px-8 pt-28 pb-16 space-y-10">

      {/* ================= HEADER ================= */}
      <div className="bg-[#14181e] p-6 rounded-xl border border-[#333] relative">
        <h1 className="text-3xl font-bold">{ticket.title}</h1>
        <p className="text-gray-300 mt-2">{ticket.description}</p>

        {(isAdmin || isAgent) && (
          <button
            onClick={summarizeTicket}
            disabled={aiLoading}
            className="absolute top-6 right-6 bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-600"
          >
            {aiLoading ? "Summarizing..." : "🧠 Summarize"}
          </button>
        )}

        {aiSummary && (
          <div className="bg-[#0c1116] mt-4 p-4 rounded border border-[#333]">
            <p className="text-sm text-blue-400 font-semibold mb-1">
              AI Summary
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {aiSummary}
            </p>
          </div>
        )}
      </div>

      {/* ================= MANAGE TICKET ================= */}
      {(isAdmin || isAgent) && (
        <div className="bg-[#14181e] p-6 rounded-xl border border-[#333] max-w-xl space-y-4">
          <h2 className="text-xl font-bold">Manage Ticket</h2>

          <select
            className="w-full p-3 bg-[#1d232b] rounded-lg"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>

          <select
            className="w-full p-3 bg-[#1d232b] rounded-lg"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>

          {isAdmin && (
            <select
              className="w-full p-3 bg-[#1d232b] rounded-lg"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="">Select Agent</option>
              {agents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={updateTicket}
            disabled={updating}
            className="bg-blue-600 w-full py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-600"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* ================= COMMENTS ================= */}
      <div className="bg-[#14181e] p-6 rounded-xl border border-[#333]">
        <h2 className="text-2xl font-bold mb-4">💬 Comments</h2>

        {ticket.comments?.map((c, i) => (
          <div
            key={i}
            className="p-4 bg-[#0b0d10] rounded border border-[#333] mb-3"
          >
            <p>{c.message}</p>

            {c.attachment && (
              <a
                href={c.attachment}
                target="_blank"
                className="text-blue-400 underline block mt-2"
              >
                📎 View File
              </a>
            )}

            <p className="text-xs text-gray-400 mt-2">
              {new Date(c.createdAt).toLocaleString()}
            </p>
          </div>
        ))}

        {(isAdmin || isAgent) && (
          <div className="mt-5 flex gap-3">
            <input
              placeholder="Write comment..."
              className="flex-1 p-3 bg-[#1d232b] rounded-lg"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              disabled={!comment.trim()}
              onClick={addComment}
              className="bg-green-600 px-5 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-600"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
