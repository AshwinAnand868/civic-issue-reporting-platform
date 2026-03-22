"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
import { Home, Menu,LogOut } from "lucide-react";
import { FaMicrophone } from "react-icons/fa";

// ✅ Dynamically import leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });
const TooltipLeaflet = dynamic(() => import("react-leaflet").then((mod) => mod.Tooltip), { ssr: false });

interface Report {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  status: "Submitted" | "Acknowledged" | "In-Progress" | "Resolved" | "Rejected";
  priority: "Low" | "Medium" | "High";
  coordinates: [number, number];
}

interface Message {
  sender: "user" | "bot";
  text: string;
}
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


export default function AdminDashboard() {
  const router = useRouter();
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

  const [reportList, setReportList] = useState<Report[]>(
    Array.from({ length: 30 }, (_, i) => {
      const city = cityData[i % cityData.length];
      const offset = (Math.random() - 0.5) * 0.2;
      return {
        id: i + 1,
        title: `Issue #${i + 1}`,
        description: `Description ${i + 1}`,
        category: ["Road", "Water", "Garbage"][i % 3],
        location: city.name,
        status: [
          "Submitted",
          "Acknowledged",
          "In-Progress",
          "Resolved",
          "Rejected",
        ][i % 5] as Report["status"],
        priority: ["Low", "Medium", "High"][i % 3] as Report["priority"],
        coordinates: [city.coords[0] + offset, city.coords[1] + offset],
      };
    })
  );


  const handleStatusChange = (id: number, newStatus: Report["status"]) => {
    console.log("Changing status:", id, newStatus);
    setReportList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };
  
  

  const [showSidebar, setShowSidebar] = useState(false);

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
  }, []); */

  

  // ✅ Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortColumn, setSortColumn] = useState<keyof Report | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredReports = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    let data = reportList.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower) ||
        r.category.toLowerCase().includes(lower) ||
        r.location.toLowerCase().includes(lower) ||
        r.status.toLowerCase().includes(lower) ||
        String(r.id).includes(lower);
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchLocation = selectedLocation ? r.location === selectedLocation : true;
      return matchSearch && matchStatus && matchLocation;
    });

    if (sortColumn) {
      data = [...data].sort((a, b) => {
        const valA = a[sortColumn] ?? "";
        const valB = b[sortColumn] ?? "";
        if (typeof valA === "string" && typeof valB === "string") {
          return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === "number" && typeof valB === "number") {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return data;
  }, [reportList, searchQuery, statusFilter, sortColumn, sortOrder, selectedLocation]);

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const currentReports = filteredReports.slice((page - 1) * reportsPerPage, page * reportsPerPage);

  const handleSort = (col: keyof Report) => {
    if (sortColumn === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortColumn(col);
      setSortOrder("asc");
    }
  };

  const statusCounts = reportList.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = reportList.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([key, value]) => ({ name: key, value }));
  const barData = Object.entries(categoryCounts).map(([key, value]) => ({ category: key, reports: value }));
  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  const getColor = (priority: string) => {
    if (priority === "High") return blink ? "#ff0000" : "#cc0000";
    if (priority === "Medium") return blink ? "#ffa500" : "#cc8400";
    return blink ? "#00cc44" : "#009933";
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 bg-blue-600 text-white sticky top-0 z-40 shadow-md z-[999]">
  <div className="flex items-center gap-4">
    <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden">
      <Menu className="w-6 h-6" />
    </button>

    {/* ✅ Logo and Title */}
    <div className="flex items-center gap-3">
      <Image
  src="/logo-removebg-preview.png"
  alt="JanBol Logo"
  width={60}
  height={50}
  className="hover:scale-105 transition-transform duration-300"
/>

    <div>
        <h1 className="text-xl font-bold tracking-wide">Civic Admin Dashboard</h1>
        <p
          className="text-xs font-semibold bg-gradient-to-r 
                     from-yellow-300 via-green-300 to-blue-300 
                     bg-clip-text text-transparent italic tracking-wide"
        >
          Aawaaz Aapki, Sudhar Humara
        </p>
      </div>
    </div>
  </div>

  <button
    onClick={() => router.push("/")}
    className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
  >
    <Home className="w-4 h-4" /> Back to Home
  </button>
</div>


      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div
          className={`absolute lg:relative z-30 w-64 bg-blue-50 border-r border-blue-200 p-5 flex flex-col transform ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 lg:translate-x-0`}
        >
          <h2 className="text-2xl font-bold mb-8 text-blue-700 text-center">Admin Panel</h2>
          <button
            onClick={() => {
              setCurrentPage("dashboard");
              setSelectedLocation(null);
              setShowSidebar(false);
            }}
            className={`text-left px-4 py-2 mb-2 rounded-lg ${
              currentPage === "dashboard" ? "bg-blue-600 text-white" : "hover:bg-blue-100 text-blue-800"
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => {
              setCurrentPage("issues");
              setSelectedLocation(null);
              setShowSidebar(false);
            }}
            className={`text-left px-4 py-2 mb-2 rounded-lg ${
              currentPage === "issues" ? "bg-blue-600 text-white" : "hover:bg-blue-100 text-blue-800"
            }`}
          >
            🧾 Reported Issues
          </button>


          <div className="flex items-center gap-4">
  

  {/* ✅ Logout Button at Bottom */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/");
            }}
            className="fixed bottom-6 left-6 flex items-center gap-2
             bg-gray-700
             text-white font-semibold px-5 py-2.5 rounded-xl
             shadow-lg shadow-red-500/30 backdrop-blur-md
             transition-all duration-300 hover:shadow-gray-600/40 
             hover:scale-[1.08] active:scale-95 z-50">
              
  <LogOut className="w-5 h-5" />
  <span>Logout</span>
          </button>
        
</div>

        </div>

        

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentPage === "dashboard" ? (
            <>
              <h1 className="text-3xl font-bold text-blue-700 mb-6">Admin Dashboard Overview</h1>
              <div className="mb-10 bg-blue-50 p-4 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-3 text-blue-700">Complaint Density Map</h2>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <MapContainer center={[22.9734, 78.6569]} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {reportList.map((issue) => {
                      const color = getColor(issue.priority);
                      const [lng, lat] = issue.coordinates;
                      return (
                        <CircleMarker
                          key={issue.id}
                          center={[lat, lng]}
                          radius={4}
                          pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
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
                            {issue.location} | {issue.category}
                          </TooltipLeaflet>
                        </CircleMarker>
                      );
                    })}
                  </MapContainer>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center shadow-sm">
                    <h3 className="text-gray-700">{status}</h3>
                    <p className="text-2xl font-bold text-blue-700">{count}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-blue-700 mb-4">Reports by Category</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <XAxis dataKey="category" stroke="#555" />
                      <YAxis stroke="#555" />
                      <Tooltip />
                      <Bar dataKey="reports" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-blue-700 mb-4">Reports by Status</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
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
              <h1 className="text-3xl font-bold text-blue-700 mb-6">
                Reported Issues {selectedLocation ? `in ${selectedLocation}` : ""}
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="🔍 Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-1/2 p-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-400"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-1/3 p-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-400"
                >
                  <option value="All">All Status</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Acknowledged">Acknowledged</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-sm sm:text-base">
                  <thead>
                    <tr className="text-blue-700">
                      <th onClick={() => handleSort("id")} className="p-3 cursor-pointer">ID</th>
                      <th onClick={() => handleSort("title")} className="p-3 cursor-pointer">Title</th>
                      <th onClick={() => handleSort("category")} className="p-3 cursor-pointer">Category</th>
                      <th onClick={() => handleSort("location")} className="p-3 cursor-pointer">Location</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReports.map((r) => (
                      <tr key={r.id} className="hover:bg-blue-100 transition">
                        <td className="p-3">{r.id}</td>
                        <td className="p-3">{r.title}</td>
                        <td className="p-3">{r.category}</td>
                        <td className="p-3">{r.location}</td>
                        <td className="p-3">{r.status}</td>
                           <td className="p-3 flex gap-2">
                        <button
                          onClick={() => handleStatusChange(r.id, "Resolved")}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm"
                        >
                          ✅ Resolve
                        </button>
                        <button
                          onClick={() => handleStatusChange(r.id, "Rejected")}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                        >
                          ❌ Reject
                        </button>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-center mt-6 text-sm">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-md ${
                      page === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-blue-700 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-md ${
                      page === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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
  );
}
