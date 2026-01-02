
// "use client";
// import { useEffect, useState } from "react";

// const PAGE_SIZE = 10;

// export default function AdminTicketsPage() {
//   const [tickets, setTickets] = useState([]);
//   const [agents, setAgents] = useState([]);

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [pendingAssign, setPendingAssign] = useState({});

//   useEffect(() => {
//     loadTickets();
//   }, [page]);

//   useEffect(() => {
//     loadAgents();
//   }, []);

//   async function loadTickets() {
//     const res = await fetch(
//       `/api/tickets?page=${page}&limit=${PAGE_SIZE}`
//     );
//     const data = await res.json();

//     setTickets(data.tickets || []);
//     setTotalPages(data.totalPages || 1);
//   }

//   async function loadAgents() {
//     const res = await fetch("/api/users/agents");
//     const data = await res.json();
//     setAgents(data.agents || []);
//   }

//   async function assignAgent(ticketId, agentId) {
//     if (!agentId) return;

//     await fetch(`/api/tickets/${ticketId}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ assignedTo: agentId }),
//     });

//     setPendingAssign((prev) => {
//       const copy = { ...prev };
//       delete copy[ticketId];
//       return copy;
//     });

//     loadTickets();
//   }

//   return (
//     <div className="min-h-screen bg-[#0b0d10] text-white p-10 pt-24 pb-32">
//       <h1 className="text-4xl font-bold mb-8">📁 Admin Ticket Control Center</h1>

//       <div className="overflow-x-auto rounded-xl border border-[#333]">
//         <table className="w-full bg-[#14181e]">
//           <thead className="bg-[#1d232b] text-gray-300">
//             <tr>
//               <th className="p-4 text-left">Title</th>
//               <th className="p-4">User</th>
//               <th className="p-4">Priority</th>
//               <th className="p-4">Status</th>
//               <th className="p-4">Agent</th>
//               <th className="p-4">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {tickets.map((t) => {
//               const selectedAgent =
//                 pendingAssign[t._id] ?? t.assignedTo?._id ?? "";

//               return (
//                 <tr key={t._id} className="border-t border-[#333]">
//                   <td className="p-4">{t.title}</td>
//                   <td className="p-4">{t.createdBy?.email}</td>
//                   <td className="p-4">{t.priority}</td>
//                   <td className="p-4">{t.status}</td>

//                   <td className="p-4">
//                     <select
//                       className="bg-[#1d232b] p-2 rounded"
//                       value={selectedAgent}
//                       onChange={(e) =>
//                         setPendingAssign({
//                           ...pendingAssign,
//                           [t._id]: e.target.value,
//                         })
//                       }
//                     >
//                       <option value="">Select Agent</option>
//                       {agents.map((a) => (
//                         <option key={a._id} value={a._id}>
//                           {a.name}
//                         </option>
//                       ))}
//                     </select>
//                   </td>

//                   <td className="p-4 flex gap-2">
//                     <button
//                       disabled={!pendingAssign[t._id]}
//                       onClick={() =>
//                         assignAgent(t._id, pendingAssign[t._id])
//                       }
//                       className="bg-green-600 px-4 py-1 rounded disabled:opacity-40"
//                     >
//                       Save
//                     </button>

//                     <button
//                       onClick={() =>
//                         (window.location.href = `/tickets/${t._id}`)
//                       }
//                       className="bg-blue-600 px-4 py-1 rounded"
//                     >
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {totalPages > 1 && (
//         <div className="fixed bottom-0 left-0 right-0 bg-[#0b0d10] border-t border-[#333] py-4">
//           <div className="flex justify-center gap-6">
//             <button
//               disabled={page === 1}
//               onClick={() => setPage(page - 1)}
//               className="px-4 py-2 bg-[#1d232b] rounded disabled:opacity-40"
//             >
//               Prev
//             </button>

//             <span>
//               Page {page} of {totalPages}
//             </span>

//             <button
//               disabled={page === totalPages}
//               onClick={() => setPage(page + 1)}
//               className="px-4 py-2 bg-[#1d232b] rounded disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AdminTicketsTableSkeleton from "@/components/skeletons/AdminTicketsTableSkeleton";

const PAGE_SIZE = 10;

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [pendingAssign, setPendingAssign] = useState({});

  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);

  useEffect(() => {
    loadTickets();
  }, [page]);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadTickets() {
    setLoadingTickets(true);

    const res = await fetch(
      `/api/tickets?page=${page}&limit=${PAGE_SIZE}`
    );
    const data = await res.json();

    setTickets(data.tickets || []);
    setTotalPages(data.totalPages || 1);
    setLoadingTickets(false);
  }

  async function loadAgents() {
    setLoadingAgents(true);

    const res = await fetch("/api/users/agents");
    const data = await res.json();

    setAgents(data.agents || []);
    setLoadingAgents(false);
  }

  async function assignAgent(ticketId, agentId) {
    if (!agentId) return;

    await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: agentId }),
    });

    setPendingAssign((prev) => {
      const copy = { ...prev };
      delete copy[ticketId];
      return copy;
    });

    loadTickets();
  }

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white p-10 pt-24 pb-32">
      <h1 className="text-4xl font-bold mb-8">
        📁 Admin Ticket Control Center
      </h1>

      {/* TABLE / SKELETON */}
      {loadingTickets ? (
        <AdminTicketsTableSkeleton rows={PAGE_SIZE} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#333]">
          <table className="w-full bg-[#14181e]">
            <thead className="bg-[#1d232b] text-gray-300">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4">User</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((t) => {
                const selectedAgent =
                  pendingAssign[t._id] ?? t.assignedTo?._id ?? "";

                return (
                  <tr key={t._id} className="border-t border-[#333]">
                    <td className="p-4">{t.title}</td>
                    <td className="p-4">{t.createdBy?.email}</td>
                    <td className="p-4">{t.priority}</td>
                    <td className="p-4">{t.status}</td>

                    <td className="p-4">
                      {loadingAgents ? (
                        <Skeleton className="h-8 w-full" />
                      ) : (
                        <select
                          className="bg-[#1d232b] p-2 rounded w-full"
                          value={selectedAgent}
                          onChange={(e) =>
                            setPendingAssign({
                              ...pendingAssign,
                              [t._id]: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Agent</option>
                          {agents.map((a) => (
                            <option key={a._id} value={a._id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="p-4 flex gap-2">
                      <button
                        disabled={!pendingAssign[t._id]}
                        onClick={() =>
                          assignAgent(t._id, pendingAssign[t._id])
                        }
                        className="bg-green-600 px-4 py-1 rounded disabled:opacity-40"
                      >
                        Save
                      </button>

                      <button
                        onClick={() =>
                          (window.location.href = `/tickets/${t._id}`)
                        }
                        className="bg-blue-600 px-4 py-1 rounded"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0b0d10] border-t border-[#333] py-4">
          <div className="flex justify-center gap-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-[#1d232b] rounded disabled:opacity-40"
            >
              Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-[#1d232b] rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
