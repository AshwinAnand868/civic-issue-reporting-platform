"use client";

import Link from "next/link";
import { useState } from "react";
import NabBar from "./navBar";
import ContentArea from "@/Content";
import Footer from "./Footer";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-900">
      {/* Header / Navbar (fixed) */}
      <NabBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {/* Page content (add top padding to avoid fixed header) */}
      <main className="pt-24">
        {/* HERO */}
        <ContentArea />
        <Footer />
      </main>
    </div>
  );
}
