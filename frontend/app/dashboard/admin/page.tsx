// frontend/app/dashboard/admin/page.tsx

"use client";
import React from 'react';
import { FaChartLine, FaCheckSquare, FaExclamationTriangle } from 'react-icons/fa';

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-2 border-b-4 border-blue-200 pb-2">Administrator Dashboard</h1>
            <p className="text-xl text-gray-700 mb-8">System Overview & Issue Management Console</p>
            
            {/* Admin-Specific Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-red-600 hover:shadow-2xl transition">
                    <p className="font-bold text-lg text-red-700 flex items-center"><FaExclamationTriangle className="mr-2"/> Pending Review</p>
                    <p className="text-5xl text-red-700 mt-2 font-extrabold">15</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-blue-600 hover:shadow-2xl transition">
                    <p className="font-bold text-lg text-blue-700 flex items-center"><FaChartLine className="mr-2"/> In Progress</p>
                    <p className="text-5xl text-blue-700 mt-2 font-extrabold">42</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-green-600 hover:shadow-2xl transition">
                    <p className="font-bold text-lg text-green-700 flex items-center"><FaCheckSquare className="mr-2"/> Resolved This Week</p>
                    <p className="text-5xl text-green-700 mt-2 font-extrabold">28</p>
                </div>
            </div>

            {/* Admin Issue Table Placeholder */}
            <div className="mt-10 bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                <h2 className="text-3xl font-extrabold text-blue-900 mb-4">Issue Management Table (Departmental View)</h2>
                <p className="text-gray-600">This section displays all issues assigned to your department with filtering, sorting, and status update controls.</p>
            </div>
        </div>
    );
}