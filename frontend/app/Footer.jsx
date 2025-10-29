function Footer() {
  return (
    <div>
      <footer className="mt-1 bg-gradient-to-br from-blue-50 to-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center text-gray-700">
          {/* Logo or Brand Name */}
          <h4 className="text-xl font-bold text-blue-800 mb-4">JanBol</h4>
          <p className="text-sm text-gray-500 mb-6">
            The People’s Voice — Empowering Citizens for a Cleaner, Safer
            Community
          </p>

          {/* Navigation Links */}
          <div className="flex justify-center gap-6 mb-6 text-sm text-blue-600">
            <a href="#features" className="hover:underline">
              Features
            </a>
            <a href="#how-it-works" className="hover:underline">
              How It Works
            </a>
            <a href="#report" className="hover:underline">
              Report Issue
            </a>
            <a href="#contact" className="hover:underline">
              Contact
            </a>
          </div>

          {/* Social Icons (Placeholder) */}
          <div className="flex justify-center gap-4 mb-6">
            <a href="#" className="text-blue-600 hover:text-blue-800 text-xl">
              🌐
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-xl">
              🐦
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800 text-xl">
              📘
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-blue-700">JanBol</span>. All
            rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
