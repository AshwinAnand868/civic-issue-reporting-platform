"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "citizen" | "admin";
};

type Issue = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  status: string;
  photo_url?: string;
  voice_url?: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (raw) {
      try {
        setUser(JSON.parse(raw) as User);
      } catch {
        setUser(null);
      }
    }

    const fetchIssues = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/issues`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setIssues(data);
        setFilteredIssues(data);
      } catch (err: any) {
        setError("Failed to load issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [router]);

  // Filters
  useEffect(() => {
    let filtered = [...issues];
    if (search)
      filtered = filtered.filter((i) =>
        i.title.toLowerCase().includes(search.toLowerCase())
      );
    if (statusFilter)
      filtered = filtered.filter((i) => i.status === statusFilter);
    if (priorityFilter)
      filtered = filtered.filter((i) => i.priority === priorityFilter);
    setFilteredIssues(filtered);
  }, [search, statusFilter, priorityFilter, issues]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  // Pie chart data
  const categoryData = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    issues.forEach((i) => {
      categoryCount[i.category] = (categoryCount[i.category] || 0) + 1;
    });
    return Object.keys(categoryCount).map((key) => ({
      name: key,
      value: categoryCount[key],
    }));
  }, [issues]);

  const recentIssues = [...issues]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const COLORS = ["#3b82f6", "#f97316", "#10b981", "#ef4444", "#8b5cf6"];

  // ---------------- CHATBOT ----------------
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    {
      sender: "bot",
      text: "Hi! I'm your Civic AI Assistant. Ask me about reports, status, or any issue.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const askAI = async (prompt: string) => {
    try {
      const res = await fetch("YOUR_API_URL/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      return data.reply;
    } catch {
      return null;
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    let response = "";

    // Try intelligent AI response
    const aiReply = await askAI(userMessage);
    if (aiReply) {
      response = aiReply;
    } else {
      // Fallback: use local reasoning based on your site’s data
      const lower = userMessage.toLowerCase();
      if (lower.includes("report") && lower.includes("how")) {
        response =
          "To report an issue, go to 'New Report' and fill out the details with photo or voice.";
      } else if (lower.includes("how many") && lower.includes("resolved")) {
        const count = issues.filter((i) => i.status === "Resolved").length;
        response = `You currently have ${count} resolved issue(s). ✅`;
      } else if (lower.includes("my latest") || lower.includes("recent")) {
        if (recentIssues.length > 0) {
          const latest = recentIssues[0];
          response = `Your latest report is titled "${latest.title}" and is currently "${latest.status}".`;
        } else {
          response = "You haven't submitted any issues yet.";
        }
      } else if (lower.includes("status")) {
        response =
          "You can view your report status in the 'My Reports' section below.";
      } else if (lower.includes("hi") || lower.includes("hello")) {
        response =
          "Hello there! 👋 How can I assist you with your civic concerns?";
      } else {
        response =
          "I'm your Civic Assistant. I can help you report, track, and understand issues around you!";
      }
    }

    setMessages((prev) => [...prev, { sender: "bot", text: response }]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6 relative text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            My Dashboard
          </h1>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="text-right">
                <div className="text-sm text-gray-600">Signed in as</div>
                <div className="font-medium text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Not signed in</div>
            )}

            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats Section */}
        {user && (
          <section className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-1 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-sm text-gray-500">{user.phone ?? ""}</div>
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total Reports" value={issues.length} />
              <StatCard
                label="Submitted"
                value={issues.filter((i) => i.status === "Submitted").length}
              />
              <StatCard
                label="Resolved"
                value={issues.filter((i) => i.status === "Resolved").length}
              />
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="🔍 Search by title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded-md text-gray-800 placeholder-gray-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-md text-gray-800"
          >
            <option value="">Filter by Status</option>
            <option value="Submitted">Submitted</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 border rounded-md text-gray-800"
          >
            <option value="">Filter by Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <button
            onClick={clearFilters}
            className="bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Issue Categories
            </h2>
            {categoryData.length === 0 ? (
              <p className="text-gray-500 text-sm">No data to display</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Recent Activity
            </h2>
            <ul className="space-y-2">
              {recentIssues.length === 0 ? (
                <li className="text-gray-500 text-sm">No recent issues</li>
              ) : (
                recentIssues.map((issue) => (
                  <li
                    key={issue._id}
                    className="p-3 border rounded-md flex justify-between text-sm"
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {issue.title}
                      </div>
                      <div className="text-gray-500">{issue.status}</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(issue.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        {/* Issues List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">My Reports</h2>
            <div className="text-sm text-gray-500">
              {filteredIssues.length} total
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg p-6 shadow">
              Loading reports…
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded">{error}</div>
          ) : filteredIssues.length === 0 ? (
            <div className="bg-white rounded-lg p-6 shadow text-gray-700">
              No issues match your filters.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIssues.map((issue) => (
                <div
                  key={issue._id}
                  onClick={() =>
                    router.push(`/dashboard/${user?.id}/issues/${issue._id}`)
                  }
                  className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
                >
                  {issue.photo_url ? (
                    <img
                      src={issue.photo_url}
                      alt={issue.title}
                      className="w-full h-36 object-cover rounded-md mb-3"
                    />
                  ) : (
                    <div className="w-full h-36 bg-blue-50 rounded-md mb-3 flex items-center justify-center text-blue-400">
                      <span className="text-sm">No image</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{issue.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {issue.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(issue.createdAt).toLocaleString()}
                      </div>
                      <div
                        className="mt-2 inline-block px-2 py-1 rounded text-xs font-medium text-white"
                        style={{
                          backgroundColor:
                            issue.priority === "High"
                              ? "#ef4444"
                              : issue.priority === "Medium"
                              ? "#f59e0b"
                              : "#10b981",
                        }}
                      >
                        {issue.priority}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="text-gray-700">
                      Category: {issue.category}
                    </div>
                    <div className="text-gray-500">Status: {issue.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 🧠 Chatbot Widget */}
      <div className="fixed bottom-5 right-5 z-50">
        {showChat ? (
          <div className="bg-white shadow-2xl w-80 h-96 rounded-2xl flex flex-col overflow-hidden border border-blue-200">
            <div className="bg-blue-600 text-white text-center py-2 font-semibold flex justify-between px-3">
              <span>Civic AI Assistant</span>
              <button onClick={() => setShowChat(false)}>✖️</button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto text-sm space-y-2 bg-gray-50 text-gray-900">
              {messages.map((msg : any, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-sm max-w-[80%] ${
                    msg.sender === "user"
                      ? "ml-auto bg-blue-600 text-white"
                      : "mr-auto bg-gray-200 text-gray-900"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="text-gray-500 text-xs italic">
                  Assistant is typing...
                </div>
              )}
            </div>

            <form
              onSubmit={handleChatSubmit}
              className="flex border-t border-gray-200"
            >
              <input
                type="text"
                placeholder="Ask about your reports..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 text-sm outline-none text-gray-900 placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 hover:bg-blue-700"
              >
                ➤
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowChat(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
          >
            💬
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 flex flex-col justify-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold text-blue-700">{value}</div>
    </div>
  );
}
