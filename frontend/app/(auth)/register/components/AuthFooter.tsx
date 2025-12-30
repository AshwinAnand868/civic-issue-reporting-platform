"use client";

import React from 'react';
// The import line must only contain components/types used directly in this file.
import { FaUserShield, FaUserPlus } from 'react-icons/fa'; 

/**
 * Footer component for the main Citizen Login page, providing navigation links
 * for Admin Login and Citizen Registration.
 */
export default function AuthFooter() {
  return (
    <div className="mt-8 pt-4 border-t border-gray-700/50 space-y-4">
      
      {/* Citizen Registration Link */}
      <a 
        href="/register" 
        className="flex items-center justify-center p-3 text-sm font-bold text-blue-300 bg-blue-900/50 rounded-lg shadow-md hover:bg-blue-800 transition duration-300 transform hover:scale-[1.01]"
      >
        <FaUserPlus className="mr-2 text-blue-300" />
        New to JanBoi? Create an Account
      </a>

      {/* OR Separator */}
      <div className="flex items-center justify-center py-2">
        <span className="text-gray-500 font-medium text-sm">--- OR ---</span>
      </div>

      {/* Admin Login Link (High contrast callout) */}
      <a 
        href="/admin/login" 
        className="flex items-center justify-center p-3 text-sm font-extrabold text-white bg-blue-700 rounded-lg shadow-xl hover:bg-blue-800 transition duration-300 transform hover:scale-[1.01]"
      >
        <FaUserShield className="mr-2 text-white" />
        ADMINISTRATOR LOGIN
      </a>
    </div>
  );
}
