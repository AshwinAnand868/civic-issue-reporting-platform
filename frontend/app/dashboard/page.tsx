// frontend/app/dashboard/page.tsx - NEW REDIRECTOR FILE

"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// NOTE: You must implement a proper function to get the user's role 
// from the stored JWT token here. This is a placeholder for that logic.
const getUserRoleFromToken = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // In a real app, securely decode the token to get the role
    if (token) {
        // MOCK DECODE: Assuming token is valid, check if it leads to Admin or Citizen
        // You'll replace this with your actual JWT decode logic.
        if (token.length > 500) return 'admin'; // Example guess
        return 'citizen';
    }
    return null;
};

export default function DashboardRedirector() {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const userRole = getUserRoleFromToken();
        setRole(userRole);

        if (!userRole) {
            router.replace('/login'); // Not authenticated
        } else if (userRole === 'admin') {
            router.replace('/dashboard/admin'); // Redirect Admin to Admin page
        } else {
            router.replace('/dashboard/citizen'); // Redirect Citizen to Citizen page
        }
    }, [router]);

    // Show a loading screen while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <p className="text-blue-700 text-lg font-semibold">Loading Dashboard...</p>
        </div>
    );
}