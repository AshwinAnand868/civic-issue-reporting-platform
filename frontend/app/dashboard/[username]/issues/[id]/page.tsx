/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// --- REQUIRED IMPORTS ---
import React, { JSX } from 'react'; 
import Image from 'next/image'; // For best performance
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
    FaMapMarkerAlt, FaCalendarAlt, FaHeadset, FaCamera, FaClipboardList, 
    FaCheckCircle, FaExclamationTriangle, FaHourglassHalf, FaUserCog, FaBuilding, FaRegClock, FaRoute, FaThumbsUp 
} from 'react-icons/fa'; 

// --- TYPE DEFINITIONS ---
type IssueStatus = "Submitted" | "Acknowledged" | "In-Progress" | "Resolved" | "Rejected";

type Issue = {
    _id: string;
    title: string;
    description: string;
    category: string;
    priority: "Low" | "Medium" | "High";
    status: IssueStatus; 
    photo_url?: string;
    voice_url?: string;
    location: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
    location_address?: string; 
    createdAt: string;
    updatedAt: string;
    department_id?: string;
    assigned_admin_id?: string | null;
    department_name?: string; 
    assigned_admin_name?: string; 
    
    activity_log?: {
        timestamp: string;
        status: IssueStatus;
        details: string;
        user: string;
    }[];
};

// --- HELPER FUNCTIONS ---
const getStatusStyles = (status: string) => { 
    switch (status as IssueStatus) {
        case "Resolved":
            return { text: "Resolved", color: "bg-green-600", icon: <FaCheckCircle className="inline mr-2" /> };
        case "In-Progress":
            return { text: "In Progress", color: "bg-blue-700", icon: <FaHourglassHalf className="inline mr-2" /> }; // Darker blue
        case "Acknowledged":
            return { text: "Acknowledged", color: "bg-yellow-600", icon: <FaRegClock className="inline mr-2" /> };
        case "Rejected":
            return { text: "Rejected", color: "bg-red-600", icon: <FaExclamationTriangle className="inline mr-2" /> };
        default: // Submitted
            return { text: status, color: "bg-gray-500", icon: <FaClipboardList className="inline mr-2" /> };
    }
};

const getPriorityStyles = (priority: Issue['priority'] = "Medium") => {
    switch (priority) {
        case "High": return "bg-red-600";
        case "Medium": return "bg-orange-500";
        default: return "bg-green-500";
    }
};

const LIFECYCLE_STEPS: IssueStatus[] = ["Submitted", "Acknowledged", "In-Progress", "Resolved"];

// Mock Data 
const MOCK_ACTIVITY_LOG = [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), status: "Submitted" as IssueStatus, details: "Issue logged by citizen.", user: "Citizen" },
    { timestamp: new Date(Date.now() - 1800000).toISOString(), status: "Acknowledged" as IssueStatus, details: "Issue received and categorized by Municipal Desk.", user: "System" },
    { timestamp: new Date(Date.now() - 600000).toISOString(), status: "In-Progress" as IssueStatus, details: "Assigned to Public Works Team 3.", user: "Admin User X" },
];


// --- HELPER COMPONENTS DEFINED HERE ---

// ENHANCED DETAIL BOX
const DetailBox = ({ icon, label, value, color }: { icon: JSX.Element, label: string, value: string, color: string }) => (
    <div className="flex flex-col space-y-1 p-3 bg-white border border-blue-100 rounded-lg transition-all duration-300 hover:shadow-lg hover:border-blue-300 transform hover:-translate-y-0.5">
        <span className={`text-xs font-medium uppercase ${color} flex items-center`}>
            {React.cloneElement(icon, { className: 'mr-1' })}
            {label}
        </span>
        <span className="text-lg font-extrabold text-gray-900">{value}</span>
    </div>
);


// Stepper Component for Visual Progress (Highest Contrast)
const ProgressStepper = ({ currentStatus }: { currentStatus: IssueStatus }) => {
    const currentIndex = LIFECYCLE_STEPS.indexOf(currentStatus);

    const logStatusStyles = (status: string) => {
        switch (status as IssueStatus) {
            case "Resolved": return { color: "bg-green-600" };
            case "In-Progress": return { color: "bg-blue-600" };
            case "Acknowledged": return { color: "bg-yellow-600" };
            default: return { color: "bg-gray-500" };
        }
    };

    return (
        <div className="flex justify-between items-center w-full my-4 p-5 bg-white rounded-xl border-2 border-blue-300 shadow-2xl">
            {LIFECYCLE_STEPS.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                
                // Enhanced color logic for deep blue path
                const circleColor = isCompleted || isActive ? 'bg-blue-700' : 'bg-blue-200';
                const ringEffect = isActive ? 'ring-4 ring-blue-400 scale-110' : '';
                const textColor = isCompleted || isActive ? 'text-blue-800 font-extrabold' : 'text-gray-500 font-semibold';
                const lineHeight = isCompleted ? 'bg-blue-700' : 'bg-blue-200';

                return (
                    <div key={step} className={`flex flex-col items-center w-1/4 ${index < LIFECYCLE_STEPS.length - 1 ? 'relative' : ''}`}>
                        
                        {/* Circle/Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white z-10 transition-all duration-500 ${circleColor} ${ringEffect} shadow-lg`}>
                            {isCompleted ? <FaCheckCircle size={18} /> : (isActive ? <FaRegClock size={18} /> : index + 1)}
                        </div>
                        
                        {/* Label */}
                        <span className={`mt-3 text-xs text-center transition-colors duration-300 ${textColor} uppercase tracking-wider`}>
                            {step.replace('-', ' ')}
                        </span>
                        
                        {/* Connector Line */}
                        {index < LIFECYCLE_STEPS.length - 1 && (
                            <div className={`absolute left-[calc(50%+20px)] top-5 -z-0 h-1 w-[calc(100%-40px)] -ml-1/2 transition-colors duration-500 ${lineHeight}`}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};


// --- MAIN COMPONENT ---
export default function IssueDetailPage() {
    const params = useParams();
    const router = useRouter();

    const userId = params.username as string;
    const issueId = params.id as string;

    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching Logic (MOCKED for UI demonstration) ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchIssue = async () => {
            try {
                setLoading(true);
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE}/api/issues/users/${userId}/issues/${issueId}`,
                    {
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    }
                );

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data?.error || "Failed to fetch issue");
                }

                let data = (await res.json()) as Issue;
                
                // --- MOCKING AUXILIARY DATA (To be replaced by your server logic) ---
                data = {
                    ...data,
                    status: 'In-Progress', 
                    activity_log: MOCK_ACTIVITY_LOG, 
                    department_name: data.department_id ? "Public Works Department" : "Unassigned", 
                    assigned_admin_name: data.assigned_admin_id ? "John Smith (Field Lead)" : "None",
                    location_address: "Panchkula Sector 12, near main market.", 
                    location: data.location || { type: "Point", coordinates: [76.8431, 30.7333] }, 
                };
                
                setIssue(data);
            } catch (err: any) {
                setError(err.message || "Failed to load issue details");
            } finally {
                setLoading(false);
            }
        };

        if (userId && issueId) fetchIssue();
    }, [userId, issueId, router]);

    // --- Loading/Error States ---
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-600 text-lg">Loading issue details...</p></div>;
    }

    if (error || !issue) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <p className="text-red-600 text-lg mb-4">{error || "Issue not found"}</p>
                <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Go Back</button>
            </div>
        );
    }

    // --- Component Data Formatting ---
    const statusInfo = getStatusStyles(issue.status);
    const priorityColor = getPriorityStyles(issue.priority);
    const formattedCreatedAt = new Date(issue.createdAt).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
    const [lng, lat] = issue.location.coordinates;
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;


    // --- 2. THE FINAL DHAMAKEDAAR LAYOUT ---
    return (
        <div className="min-h-screen bg-blue-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. HERO HEADER (The Statement Piece) */}
                <header className="flex flex-col md:flex-row md:items-center md:justify-between p-8 rounded-2xl shadow-2xl border-l-8 border-blue-900 bg-white/90 backdrop-blur-md transition-all duration-300 hover:shadow-3xl">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-blue-700 border border-blue-400 bg-blue-100 rounded-full hover:bg-blue-200 transition font-semibold shadow-md"
                        >
                            ← Dashboard
                        </button>
                        <div>
                            <p className="text-sm font-extrabold text-blue-600 uppercase tracking-widest">Issue ID: {issue._id.substring(issue._id.length - 8).toUpperCase()}</p>
                            <h1 className="text-4xl font-extrabold text-gray-900 mt-1">{issue.title}</h1>
                        </div>
                    </div>

                    {/* HIGHLY VISIBLE STATUS TAG */}
                    <div className={`mt-4 md:mt-0 px-6 py-3 rounded-full font-bold text-xl text-white ${statusInfo.color} shadow-2xl transition-transform transform hover:scale-105 hover:brightness-110`}>
                        {statusInfo.icon}
                        {statusInfo.text}
                    </div>
                </header>

                {/* 2. VISUAL PROGRESS STEPPER */}
                <ProgressStepper currentStatus={issue.status} />


                {/* 3. MAIN CONTENT: GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: DETAILS & MEDIA (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* CORE DETAILS CARD */}
                        <div className="bg-white p-8 rounded-2xl shadow-2xl space-y-6 border border-blue-100 transition-all duration-300 hover:shadow-3xl">
                            <h2 className="text-3xl font-extrabold text-blue-800 border-b-2 border-blue-100 pb-3 mb-4">Report Details</h2>

                            {/* KEY METRICS GRID */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <DetailBox icon={<FaClipboardList />} label="Category" value={issue.category} color="text-blue-700" />
                                <DetailBox icon={<FaCalendarAlt />} label="Reported On" value={formattedCreatedAt} color="text-blue-700" />
                                <DetailBox icon={<FaBuilding />} label="Department" value={issue.department_name || "Unassigned"} color="text-blue-700" />
                                <div className={`flex flex-col p-3 rounded-lg text-white font-bold text-center ${priorityColor} shadow-lg transform transition-transform duration-300 hover:scale-[1.03]`}>
                                    <span className="text-xs opacity-90 tracking-wider">PRIORITY LEVEL</span>
                                    <span className="text-xl font-extrabold">{issue.priority}</span>
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <section className="pt-4">
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">Description</h3>
                                <p className="text-gray-700 leading-relaxed bg-blue-50/70 p-5 rounded-xl border border-blue-200 shadow-inner italic transition-all duration-300 hover:shadow-md">
                                    {issue.description}
                                </p>
                            </section>
                            
                            {/* ASSIGNED ADMIN */}
                            {issue.assigned_admin_id && (
                                <section className="pt-4">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Assigned Officer</h3>
                                    <div className="flex items-center text-gray-700 bg-blue-100/70 p-5 rounded-xl border-l-4 border-blue-600 shadow-md transition-shadow duration-300 hover:shadow-lg">
                                        <FaUserCog className="text-blue-600 text-3xl mr-4"/>
                                        <div>
                                            <p className="font-extrabold text-lg text-blue-800">{issue.assigned_admin_name || "Admin ID: " + issue.assigned_admin_id}</p>
                                            <p className="text-sm text-blue-600">This individual is directly responsible for tracking the resolution process.</p>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                        
                        {/* ATTACHED MEDIA CARD */}
                        {(issue.photo_url || issue.voice_url) && (
                            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-blue-100 transition-all duration-300 hover:shadow-3xl">
                                <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-3 mb-4">Attached Evidence</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {issue.photo_url && (
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-700 flex items-center mb-3"><FaCamera className="mr-2 text-blue-500"/> Report Image</h3>
                                            <div className="relative w-full h-56 group">
                                                <Image 
                                                    src={issue.photo_url} 
                                                    alt="Issue Photo" 
                                                    fill 
                                                    style={{ objectFit: 'cover' }}
                                                    className="rounded-lg shadow-xl border-4 border-blue-100 cursor-pointer transition duration-300 group-hover:scale-[1.05] group-hover:shadow-2xl"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {issue.voice_url && (
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-700 flex items-center mb-3"><FaHeadset className="mr-2 text-blue-500"/> Voice Recording</h3>
                                            <audio controls src={issue.voice_url} className="w-full mt-2 rounded-lg bg-blue-50 p-3 border border-blue-200 shadow-inner"/>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* RESOLUTION PROOF (Green Accent) */}
                        {issue.status === 'Resolved' && (
                            <div className="bg-green-50 p-8 rounded-2xl shadow-2xl border-l-8 border-green-600 transform transition-transform duration-300 hover:scale-[1.01]">
                                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center"><FaThumbsUp className="mr-3"/> Resolution Confirmed</h2>
                                <p className="text-green-800 mb-4 font-semibold">
                                    The civic issue has been successfully resolved by the department. Thank you for your contribution!
                                </p>
                                <div className="h-40 bg-green-100 flex items-center justify-center text-green-700 rounded-lg border border-dashed border-green-400">
                                    
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: LOCATION AND ACTIVITY (1/3 width) */}
                    <div className="lg:col-span-1 space-y-8">
                        
                        {/* LOCATION CARD */}
                        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-blue-100 transition-all duration-300 hover:shadow-3xl">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center border-b pb-2 mb-4">
                                <FaMapMarkerAlt className="mr-2 text-blue-600"/> Location & Map
                            </h2>
                            
                            <div className="space-y-3">
                                <p className="text-gray-700 font-semibold flex items-center text-sm"><FaRoute className="mr-2 text-blue-400"/> {issue.location_address || "Address Not Available"}</p>
                                
                                <div className="h-56 w-full bg-blue-50 flex flex-col items-center justify-center text-blue-500 rounded-lg border border-dashed border-blue-300 overflow-hidden shadow-inner">
                                    <p className="mb-3 text-sm">Interactive Map Preview</p>
                                    <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-700 text-white font-medium rounded-full shadow-lg hover:bg-blue-800 transition transform hover:scale-105">
                                        View Map / Directions
                                    </a>
                                </div>
                                <p className="text-xs text-gray-500 pt-1">
                                    GPS Coords: **{lat.toFixed(6)}, {lng.toFixed(6)}**
                                </p>
                            </div>
                        </div>

                        {/* RESOLUTION TIMELINE / ACTIVITY LOG */}
                        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-blue-100 transition-all duration-300 hover:shadow-3xl">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center border-b pb-2 mb-4">
                                <FaRegClock className="mr-2 text-blue-600" /> Activity Log
                            </h2>
                            
                            {issue.activity_log && issue.activity_log.length > 0 ? (
                                <ol className="relative border-l-2 border-blue-300 ml-3">                  
                                    {issue.activity_log.map((log, index) => {
                                        const logStatusInfo = getStatusStyles(log.status); 
                                        const isEven = index % 2 === 0;
                                        return (
                                            <li key={index} className={`mb-6 ml-6 p-4 rounded-lg transition-all duration-300 ${isEven ? 'bg-blue-50/70' : 'bg-white'} border border-transparent hover:border-blue-400 shadow-md`}>
                                                <span className={`absolute flex items-center justify-center w-3 h-3 rounded-full -left-2 ring-4 ring-white ${logStatusInfo.color}`}>
                                                </span>
                                                <h3 className="flex items-center mb-1 text-base font-extrabold text-gray-900">
                                                    {log.status}
                                                    <span className="bg-blue-200 text-blue-900 text-xs font-medium px-2 py-0.5 rounded-full ml-3 shadow-sm">
                                                        {log.user}
                                                    </span>
                                                </h3>
                                                <time className="block mb-1 text-xs font-normal leading-none text-gray-500">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </time>
                                                <p className="text-sm font-normal text-gray-700">{log.details}</p>
                                            </li>
                                        );
                                    })}
                                </ol>
                            ) : (
                                <p className="text-gray-500 italic">No activity recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER BUTTON */}
                <div className="flex justify-center pt-10">
                    <button
                        onClick={() => router.back()}
                        className="px-12 py-4 bg-blue-800 text-white font-extrabold rounded-full shadow-2xl hover:bg-blue-900 transition transform hover:scale-[1.05] tracking-wide"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}