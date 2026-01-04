"use client";
import { useState, useRef } from "react";
import { PlusCircle, Loader2, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

/* ================= ZOD VALIDATION ================= */
const ticketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
  attachments: z.array(z.string()).optional(),
});

export default function CreateTicketPage() {

  const fileRef = useRef();

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    priority: "Low",
    file: null,
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
  });

  /* ================= CREATE ================= */
  async function createTicket(e) {
    e.preventDefault();

    const valid = ticketSchema.safeParse(form);
    if (!valid.success) {
      toast.error("Fix validation errors first!");
      return;
    }

    setCreating(true);
    try {
      let uploadedUrl = null;

      if (form.file) {
        const fd = new FormData();
        fd.append("file", form.file);

        const upload = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });

        const file = await upload.json();
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
          attachments: uploadedUrl ? [uploadedUrl] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Ticket created successfully!");

      setForm({
        title: "",
        description: "",
        category: "General",
        priority: "Low",
        file: null,
      });

      if (fileRef.current) fileRef.current.value = "";

    } catch (err) {
      toast.error(err.message);
    }

    setCreating(false);
  }

  /* ================= REMOVE FILE ================= */
  const removeFile = () => {
    setForm({ ...form, file: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] to-black text-white px-6 md:px-10 pt-28 pb-16">

      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <PlusCircle className="text-green-400" /> Create Ticket
        </h1>
        <p className="text-gray-400 text-sm">
          Submit a new support request
        </p>
      </header>

      {/* FORM */}
      <div className="max-w-xl bg-gray-900/70 border border-gray-800 p-6 rounded-2xl shadow-xl">

        <form onSubmit={createTicket} className="space-y-5">

          {/* TITLE */}
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              setErrors({
                ...errors,
                title:
                  e.target.value.length < 3
                    ? "Title must be at least 3 characters"
                    : "",
              });
            }}
            className="bg-gray-800 w-full p-3 rounded-xl outline-none"
          />
          {errors.title && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} /> {errors.title}
            </p>
          )}

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description..."
            value={form.description}
            onChange={(e) => {
              setForm({ ...form, description: e.target.value });
              setErrors({
                ...errors,
                description:
                  e.target.value.length < 5
                    ? "Description must be at least 5 characters"
                    : "",
              });
            }}
            className="bg-gray-800 w-full p-3 rounded-xl h-32 outline-none"
          />
          {errors.description && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} /> {errors.description}
            </p>
          )}

          {/* CATEGORY + PRIORITY */}
          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="bg-gray-800 p-3 rounded-xl"
            >
              <option>General</option>
              <option>Billing</option>
              <option>Technical</option>
              <option>Account</option>
              <option>Other</option>
            </select>

            <select
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value })
              }
              className="bg-gray-800 p-3 rounded-xl"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>

          {/* FILE */}
          <div className="relative">
            <input
              ref={fileRef}
              type="file"
              className="bg-gray-800 file:bg-gray-700 file:px-3 file:py-1 rounded-xl p-3 w-full"
              onChange={(e) =>
                setForm({ ...form, file: e.target.files[0] })
              }
            />

            {form.file && (
              <button
                type="button"
                onClick={removeFile}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400"
              >
                <XCircle size={20} />
              </button>
            )}
          </div>

          {/* SUBMIT */}
          <button
            disabled={creating}
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 flex justify-center gap-2"
          >
            {creating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <PlusCircle />
            )}
            Create Ticket
          </button>

        </form>
      </div>
    </div>
  );
}
