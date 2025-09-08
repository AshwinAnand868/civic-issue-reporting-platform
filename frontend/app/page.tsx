"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 text-gray-900">
      {/* Header / Navbar (fixed) */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                {/* <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md">
                  <span className="font-bold text-blue-600">JB</span>
                </div> */}
                <span className="text-2xl font-extrabold text-blue-700">JanBol</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-base font-medium text-blue-700 hover:text-blue-900">Home</Link>
              <Link href="#about" className="text-base font-medium text-gray-700 hover:text-blue-700">About</Link>
              <Link href="#features" className="text-base font-medium text-gray-700 hover:text-blue-700">Features</Link>
              <Link href="#contact" className="text-base font-medium text-gray-700 hover:text-blue-700">Contact</Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 rounded-md text-blue-700 hover:bg-blue-50">Log in</Link>
              <Link href="/register" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign up</Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen((s) => !s)}
                aria-label="Toggle menu"
                className="p-2 rounded-md bg-white shadow"
              >
                {menuOpen ? (
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu (collapsible) */}
          {menuOpen && (
            <div className="mt-3 rounded-lg bg-white shadow-md p-4 md:hidden">
              <div className="flex flex-col gap-3">
                <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-blue-700">Home</Link>
                <Link href="#about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700">About</Link>
                <Link href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700">Features</Link>
                <Link href="#contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700">Contact</Link>
                <div className="border-t mt-2 pt-3 flex gap-2">
                  <Link href="/login" className="flex-1 px-4 py-2 rounded-md text-center text-blue-700 border border-blue-100">Log in</Link>
                  <Link href="/register" className="flex-1 px-4 py-2 rounded-md text-center bg-blue-600 text-white">Sign up</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Page content (add top padding to avoid fixed header) */}
      <main className="pt-24">
        {/* HERO */}
        <section className="relative"> 
          {/* Decorative background blobs */}
          <div className="absolute -top-20 right-0 hidden lg:block">
            <svg width="480" height="480" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-30">
              <circle cx="240" cy="240" r="200" fill="#DFF3FF" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col-reverse lg:flex-row items-center gap-12">
            {/* Left: Text */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-blue-800">
                Your Voice. <span className="text-blue-600">Your City.</span>
                <br /> Your Change.
              </h2>

              <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                JanBol empowers citizens to report civic issues, track progress, and hold authorities accountable — simple, local, effective.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                <Link href="/report" className="inline-block px-7 py-4 rounded-full bg-blue-600 text-white text-lg font-semibold shadow-lg hover:bg-blue-700">Report an Issue</Link>
                <a href="#features" className="inline-block px-6 py-4 rounded-full border border-blue-600 text-blue-600 text-lg font-medium hover:bg-blue-50">Learn More</a>
              </div>

              <div className="mt-8 flex gap-6 justify-center lg:justify-start text-sm text-gray-500">
                <div>Trusted by communities</div>
                <div className="mx-2">•</div>
                <div>Transparency & follow-up</div>
              </div>
            </div>

            {/* Right: Illustration / mockup */}
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <div className="w-full max-w-lg transform hover:-translate-y-1 transition-all duration-300">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-6">
                  {/* Simple phone mockup */}
                  <div className="bg-white rounded-2xl border border-blue-100 p-4">
                    <div className="h-64 rounded-lg overflow-hidden bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                      <svg width="160" height="160" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                        <path d="M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7z" stroke="#1E3A8A" strokeWidth="0.5" opacity="0.6"/>
                        <rect x="7" y="4" width="10" height="2" rx="1" fill="#1E40AF" />
                        <rect x="8" y="8" width="8" height="2" rx="1" fill="#3B82F6" />
                        <rect x="8" y="12" width="8" height="2" rx="1" fill="#60A5FA" />
                        <rect x="8" y="16" width="6" height="2" rx="1" fill="#93C5FD" />
                      </svg>
                    </div>

                    <div className="mt-4 px-2 text-sm text-gray-500">Preview of issue feed / map (replace with real screenshot or map)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-16">
          <h3 className="text-2xl font-bold text-center text-blue-800">Why JanBol?</h3>
          <p className="mt-2 text-center text-gray-600 max-w-2xl mx-auto">Built for citizens. Built for action. Simple, transparent reporting and tracking.</p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-md">
              <h4 className="text-lg font-semibold text-blue-700">Easy Reporting</h4>
              <p className="mt-2 text-gray-600 text-sm">Submit issues with text, photos, or voice notes in under a minute.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-md">
              <h4 className="text-lg font-semibold text-blue-700">Track Progress</h4>
              <p className="mt-2 text-gray-600 text-sm">See status updates, timeline, and responsible department or staff.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-md">
              <h4 className="text-lg font-semibold text-blue-700">Notifications</h4>
              <p className="mt-2 text-gray-600 text-sm">Get notified via in-app, email, or SMS when the status changes.</p>
            </div>
          </div>
        </section>

        {/* About / Contact (placeholder) */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-blue-800">About JanBol</h3>
              <p className="mt-4 text-gray-600">JanBol is a citizen-first reporting platform that connects residents with municipal departments. We prioritise clarity, follow-up and measurable outcomes.</p>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-blue-700">Contact</h4>
              <p className="mt-2 text-gray-600">For partnerships or support, email <a href="mailto:hello@janbol.example" className="text-blue-600 underline">hello@janbol.example</a></p>
            </div>
          </div>
        </section>

      </main>

      <footer className="mt-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600">© {new Date().getFullYear()} JanBol — The People’s Voice</div>
      </footer>
    </div>
  );
}
