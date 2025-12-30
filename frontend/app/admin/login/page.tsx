"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserShield, FaSignInAlt } from 'react-icons/fa'; // Icons for the Admin theme
// Note: This file would normally NOT import AuthFooter, as it's the main page.

export default function AdminLoginPage() { // <--- THIS MUST BE THE DEFAULT EXPORT
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // TARGETS THE DEDICATED ADMIN BACKEND ROUTE
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.token); 
            router.push('/dashboard/admin'); 
        } else {
            const data = await res.json();
            setError(data.error || 'Login failed. Check credentials or role.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4" 
             style={{ backgroundImage: "url('/your-background-image.jpg')", backgroundSize: 'cover' }}>
            
            {/* Login Card with unique dark, translucent style */}
            <div className="w-full max-w-md bg-black/70 backdrop-blur-md p-10 rounded-2xl shadow-3xl border-t-4 border-blue-600 transition-all duration-300">
                
                <div className="flex flex-col items-center mb-8">
                    <FaUserShield className="text-blue-400 text-6xl mb-3"/>
                    <h1 className="text-4xl font-extrabold text-white">ADMIN ACCESS</h1>
                    <p className="text-blue-300 mt-2 tracking-wider">Secure Issue Management</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-800/80 text-white border border-red-600 rounded-lg text-sm">{error}</div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-700 bg-gray-800/80 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter secure email"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-700 bg-gray-800/80 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-extrabold shadow-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 transform hover:scale-[1.01]"
                    >
                        {loading ? 'AUTHENTICATING...' : 'LOGIN SECURELY'}
                        <FaSignInAlt />
                    </button>
                    
                    <div className="text-center text-sm mt-4">
                        <a href="/login" className="text-blue-400 hover:text-blue-200 hover:underline">
                            ← Back to Citizen Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
