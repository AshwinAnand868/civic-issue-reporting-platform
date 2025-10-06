"use client";

import Link from "next/link";

type NavBarProps = {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function NabBar({ menuOpen, setMenuOpen }: NavBarProps) {
  return (
    <div>
      {/* Header / Navbar (fixed) */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="bg-gradient-to-r from-white via-slate-200 to-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-14">
              {/* Brand */}
              <div className="flex items-center gap-">
                <Link href="/" className="flex items-center gap-3">
                  {/* <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md">
                  <span className="font-bold text-blue-600">JB</span>
                </div> */}
                  <span className="text-3xl font-bold text-blue-700">
                    JanBol
                  </span>
                </Link>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="/"
                  className="text-lg font-medium text-blue-700 hover:text-blue-900"
                >
                  Home
                </Link>
                <Link
                  href="#about"
                  className="text-lg font-medium text-gray-700 hover:text-blue-700"
                >
                  About
                </Link>
                <Link
                  href="#features"
                  className="text-lg font-medium text-gray-700 hover:text-blue-700"
                >
                  Features
                </Link>
                <Link
                  href="#contact"
                  className="text-lg font-medium text-gray-700 hover:text-blue-700"
                >
                  Contact
                </Link>
              </nav>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-blue-700 hover:bg-blue-50"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>

              {/* Mobile Hamburger Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  aria-label="Toggle menu"
                  className="p-2 rounded-md bg-white shadow"
                >
                  {menuOpen ? (
                    // X Icon
                    <svg
                      className="w-6 h-6 text-blue-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    // Hamburger Icon
                    <svg
                      className="w-6 h-6 text-blue-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu (collapsible) */}
            {menuOpen && (
              <div className="absolute md:static top-16 left-0 w-full md:w-auto bg-white md:flex md:space-x-6 p-4 transition-all duration-300 ease-in-out">
                <div className="flex flex-col gap-3">
                  <Link
                    href="/"
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-700"
                  >
                    Home
                  </Link>
                  <Link
                    href="#about"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700"
                  >
                    About
                  </Link>
                  <Link
                    href="#features"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700"
                  >
                    Features
                  </Link>
                  <Link
                    href="#contact"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700"
                  >
                    Contact
                  </Link>
                  <div className="border-t mt-2 pt-3 flex gap-2">
                    <Link
                      href="/login"
                      className="flex-1 px-4 py-2 rounded-md text-center text-blue-700 border border-blue-100"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 px-4 py-2 rounded-md text-center bg-blue-600 text-white"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default NabBar;
