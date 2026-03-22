"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";

type NavBarProps = {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type User = {
  name: string;
  role: string;
  email: string;
};

function NabBar({ menuOpen, setMenuOpen }: NavBarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setDropdownOpen(false);
    router.push("/login");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-r from-white via-slate-200 to-slate-100 shadow">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
  <Image
    src="/logo-removebg-preview.png"         // 👈 Make sure logo.jpg is in /public folder
    alt="Janbol Logo"
    width={150}
    height={120}
    className="rounded-md hover:scale-105 transition-transform duration-300"
  />
  <div className="hidden sm:block">
   
    <p
  className="text-sm font-semibold bg-gradient-to-r 
             from-blue-500 via-teal-400 via-green-400 to-yellow-400
             bg-clip-text text-transparent tracking-wide italic drop-shadow-sm"
>
  Aawaaz Aapki, Sudhar Humara
</p>

  </div>
</Link>

          {/* Desktop Navigation */}
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

          {/* Auth Buttons or User Menu */}
          <div
            className="hidden md:flex items-center gap-4 relative"
            ref={dropdownRef}
          >
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                   Hi Admin,{" "}
                  <span className="font-medium text-blue-700">
                    {user.role === "admin" ? user.email : user.name}
                  </span>
                </span>

                {/* User Icon */}
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="p-2 rounded-full bg-white border border-blue-200 hover:bg-blue-50 transition"
                  aria-label="User Menu"
                >
                  <UserIcon className="w-5 h-5 text-blue-700" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-64 bg-white border border-gray-200 shadow-lg rounded-lg py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.role === "admin" ? user.email : user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-blue-600 capitalize mt-1">
                        Role: {user.role}
                      </p>
                    </div>

                    <div className="flex flex-col">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push(
                            user.role === "admin"
                              ? "dashboard/admin"
                              : "/dashboard/citizen"
                          );
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        Go to Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-blue-700 hover:bg-blue-50 transition"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              aria-label="Toggle menu"
              className="p-2 rounded-md bg-white shadow"
            >
              {menuOpen ? (
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

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute md:static top-16 left-0 w-full bg-white md:hidden p-4 border-t shadow-sm transition-all duration-300 ease-in-out">
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

              <div className="border-t mt-3 pt-3 flex gap-2">
                {user ? (
                  <>
                    <button
                      onClick={() =>
                        router.push(
                          user.role === "admin" ? "/admin" : "/dashboard/citizen"
                        )
                      }
                      className="flex-1 px-4 py-2 rounded-md text-center text-blue-700 border border-blue-200 hover:bg-blue-50 transition"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 px-4 py-2 rounded-md text-center text-red-600 border border-red-200 hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex-1 px-4 py-2 rounded-md text-center text-blue-700 border border-blue-200"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 px-4 py-2 rounded-md text-center bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default NabBar;
