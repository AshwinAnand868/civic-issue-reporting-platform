"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "leaflet/dist/leaflet.css";
import { FaMicrophone } from "react-icons/fa";
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const TooltipLeaflet = dynamic(
  () => import("react-leaflet").then((mod) => mod.Tooltip),
  { ssr: false }
);

interface Report {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  status:
    | "Submitted"
    | "Acknowledged"
    | "In-Progress"
    | "Resolved"
    | "Rejected";
  priority: "Low" | "Medium" | "High";
  coordinates: [number, number];
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "issues">(
    "dashboard"
  );
  const [blink, setBlink] = useState(true);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const reportsPerPage = 10;
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 🎤 Voice recognition logic
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onstart = () => {
      setIsTyping(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsTyping(false);
    };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // 🔹 Send message to your backend Gemini route
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await res.json();

      // 🔹 Display AI response
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || data.message || "No response generated.",
        },
      ]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  /* 
  // ✅ Static Chatbot States
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "👋 Hello! I’m your Civic AI Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 1500);
    return () => clearInterval(interval);
  }, []); */

  const cityData = [
    { name: "Kolkata", coords: [88.3639, 22.5726] },
    { name: "Delhi", coords: [77.209, 28.6139] },
    { name: "Mumbai", coords: [72.8777, 19.076] },
    { name: "Chennai", coords: [80.2707, 13.0827] },
    { name: "Bangalore", coords: [77.5946, 12.9716] },
    { name: "Hyderabad", coords: [78.4867, 17.385] },
    { name: "Ahmedabad", coords: [72.5714, 23.0225] },
    { name: "Jaipur", coords: [75.7873, 26.9124] },
    { name: "Lucknow", coords: [80.9462, 26.8467] },
    { name: "Patna", coords: [85.1376, 25.5941] },
  ];

  const reports: Report[] = Array.from({ length: 50 }, (_, i) => {
    const city = cityData[i % cityData.length];
    const randomOffsetLng = (Math.random() - 0.5) * 0.2;
    const randomOffsetLat = (Math.random() - 0.5) * 0.2;
    return {
      id: i + 1,
      title: `Issue #${i + 1}`,
      description: `Detailed description for issue ${i + 1}`,
      category: [
        "Road",
        "Water",
        "Garbage",
        "Electricity",
        "Lighting",
        "Sanitation",
      ][i % 6],
      location: city.name,
      status: [
        "Submitted",
        "Acknowledged",
        "In-Progress",
        "Resolved",
        "Rejected",
      ][i % 5] as Report["status"],
      priority: ["Low", "Medium", "High"][i % 3] as Report["priority"],
      coordinates: [
        city.coords[0] + randomOffsetLng,
        city.coords[1] + randomOffsetLat,
      ],
    };
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortColumn, setSortColumn] = useState<keyof Report | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredReports = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    let data = reports.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower) ||
        r.category.toLowerCase().includes(lower) ||
        r.location.toLowerCase().includes(lower) ||
        r.status.toLowerCase().includes(lower) ||
        String(r.id).includes(lower);
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchLocation = selectedLocation
        ? r.location === selectedLocation
        : true;
      return matchSearch && matchStatus && matchLocation;
    });

    if (sortColumn) {
      data = [...data].sort((a, b) => {
        const valA = a[sortColumn] ?? "";
        const valB = b[sortColumn] ?? "";
        if (typeof valA === "string" && typeof valB === "string") {
          return sortOrder === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return data;
  }, [
    reports,
    searchQuery,
    statusFilter,
    sortColumn,
    sortOrder,
    selectedLocation,
  ]);

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const currentReports = filteredReports.slice(
    (page - 1) * reportsPerPage,
    page * reportsPerPage
  );

  const handleSort = (col: keyof Report) => {
    if (sortColumn === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortColumn(col);
      setSortOrder("asc");
    }
  };

  const statusCounts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryCounts = reports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([key, value]) => ({
    name: key,
    value,
  }));
  const barData = Object.entries(categoryCounts).map(([key, value]) => ({
    category: key,
    reports: value,
  }));
  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  const getColor = (priority: string) => {
    if (priority === "High") return blink ? "#ff0000" : "#cc0000";
    if (priority === "Medium") return blink ? "#ffa500" : "#cc8400";
    return blink ? "#00cc44" : "#009933";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 p-5 flex flex-col shadow-xl border-r border-gray-800">
        <h2 className="text-2xl font-bold mb-8 text-blue-400 text-center">
          Admin Panel
        </h2>
        <button
          onClick={() => {
            setCurrentPage("dashboard");
            setSelectedLocation(null);
          }}
          className={`text-left px-4 py-2 mb-2 rounded-lg transition ${
            currentPage === "dashboard"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-800 text-gray-300"
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => {
            setCurrentPage("issues");
            setSelectedLocation(null);
          }}
          className={`text-left px-4 py-2 mb-2 rounded-lg transition ${
            currentPage === "issues"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-800 text-gray-300"
          }`}
        >
          🧾 Reported Issues
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto ">
        {currentPage === "dashboard" ? (
          <>
            <h1 className="text-4xl font-bold text-blue-400 mb-8">
              Admin Dashboard Overview
            </h1>
            <div className="mb-10 bg-gray-800 p-4 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-3 text-blue-300">
                Complaint Density Map (Across India)
              </h2>
              <div className="h-[500px] rounded-lg overflow-hidden">
                <MapContainer
                  center={[22.9734, 78.6569]}
                  zoom={5}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {reports.map((issue) => {
                    const color = getColor(issue.priority);
                    const [lng, lat] = issue.coordinates;
                    return (
                      <CircleMarker
                        key={issue.id}
                        center={[lat, lng]}
                        radius={4}
                        pathOptions={{
                          color,
                          fillColor: color,
                          fillOpacity: 0.8,
                        }}
                        eventHandlers={{
                          click: () => {
                            setSelectedLocation(issue.location);
                            setCurrentPage("issues");
                          },
                        }}
                      >
                        <TooltipLeaflet>
                          <strong>{issue.title}</strong>
                          <br />
                          {issue.location} | {issue.category} | {issue.priority}
                        </TooltipLeaflet>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-10 ">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="bg-gray-800 p-5 rounded-xl shadow-lg text-center hover:bg-gray-700 transition"
                >
                  <h3 className="text-lg text-gray-300">{status}</h3>
                  <p className="text-3xl font-bold text-blue-400">{count}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-blue-300">
                  Reports by Category
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="category" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Bar
                      dataKey="reports"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-blue-300">
                  Reports by Status
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-blue-400 mb-8">
              Reported Issues {selectedLocation ? `in ${selectedLocation}` : ""}
            </h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="🔍 Search all columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-1/2 p-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-1/3 p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="bg-gray-800 p-5 rounded-xl shadow-lg overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-blue-400 text-sm md:text-base">
                    <th
                      className="p-3 cursor-pointer hover:text-blue-300"
                      onClick={() => handleSort("id")}
                    >
                      ID
                    </th>
                    <th
                      className="p-3 cursor-pointer hover:text-blue-300"
                      onClick={() => handleSort("title")}
                    >
                      Title
                    </th>
                    <th
                      className="p-3 cursor-pointer hover:text-blue-300"
                      onClick={() => handleSort("category")}
                    >
                      Category
                    </th>
                    <th
                      className="p-3 cursor-pointer hover:text-blue-300"
                      onClick={() => handleSort("location")}
                    >
                      Location
                    </th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReports.map((r) => (
                    <tr
                      key={r.id}
                      className="bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                    >
                      <td className="p-3">{r.id}</td>
                      <td className="p-3">{r.title}</td>
                      <td className="p-3">{r.category}</td>
                      <td className="p-3">{r.location}</td>
                      <td className="p-3">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-md ${
                    page === 1
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-300 text-sm">
                  Page <span className="font-bold text-blue-400">{page}</span>{" "}
                  of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-md ${
                    page === totalPages
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        {/* ✅ AI Chatbot Floating Widget */}
        <div className="fixed bottom-6 right-6 z-[999]">
          {showChat ? (
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-80 h-96 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-blue-600 p-3 flex justify-between items-center">
                <h3 className="text-white font-semibold">Civic AI Assistant</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white hover:text-gray-200 text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-800 text-sm">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg max-w-[75%] break-words ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white self-end ml-auto"
                        : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="text-gray-400 text-xs animate-pulse">
                    Assistant is typing...
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSend}
                className="flex border-t border-gray-700 items-center"
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-gray-800 text-white p-2 text-sm focus:outline-none"
                />

                {/* 🎤 Mic Button */}
                <button
                  type="button"
                  onClick={startListening}
                  className="px-3 text-white hover:text-blue-400 flex items-center justify-center"
                  title="Speak"
                >
                  <FaMicrophone color="white" size={18} />
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 px-3 text-white hover:bg-blue-700"
                >
                  ➤
                </button>
              </form>
            </div>
          ) : (
            // Floating Chat Icon
            <button
              onClick={() => setShowChat(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-transform transform hover:scale-110"
            >
              💬
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
