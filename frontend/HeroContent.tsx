import Link from "next/link";

function Hero() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Large decorative circles */}
          <div className="absolute -top-40 -right-20 w-96 h-96 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 -left-32 w-64 h-64 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full opacity-15 animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full opacity-10 animate-pulse delay-2000"></div>

          {/* Floating geometric shapes */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rotate-45 opacity-30 animate-bounce"></div>
          <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-bounce delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-400 opacity-50 animate-bounce delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            {/* Left: Enhanced Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Join 2.5M+ active citizens
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                  <span className="text-gray-900">Your Voice.</span>
                  <br />
                  <span className="text-blue-600 relative">
                    Your City.
                    <svg
                      className="absolute -bottom-4 left-0 w-full h-4 text-blue-300"
                      viewBox="0 0 300 12"
                      fill="none"
                    >
                      <path
                        d="M5 8c50-4 100-4 150 0s100 4 150-2"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <br />
                  <span className="text-gray-900">Your</span>{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Change.
                  </span>
                </h1>
              </div>

              {/* Enhanced Description */}
              <div className="space-y-4">
                <p className="text-xl sm:text-2xl text-gray-700 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Transform your community with India's most trusted civic
                  engagement platform.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Report issues instantly, track real-time progress, and hold
                  authorities accountable — all while connecting with fellow
                  citizens who care about change.
                </p>
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/report"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 group-hover:rotate-12 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Report an Issue
                  <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </Link>

                <a
                  href="#features"
                  className="group inline-flex items-center gap-3 px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg font-medium rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Learn More
                </a>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      />
                    </svg>
                    <span className="font-medium">Trusted by 50+ cities</span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">95% satisfaction rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Enhanced Interactive Mockup */}
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Floating Elements around mockup */}
                <div className="absolute -top-8 -left-8 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="absolute -top-4 -right-8 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-bounce delay-500">
                  <span className="text-xl">📍</span>
                </div>
                <div className="absolute -bottom-8 -left-4 w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center animate-bounce delay-1000">
                  <span className="text-xl">🚀</span>
                </div>

                {/* Main Phone Layout */}
                <div className="relative w-full max-w-sm transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group">
                  <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-3xl shadow-2xl p-6 group-hover:shadow-3xl transition-shadow duration-500">
                    {/* Phone Frame */}
                    <div className="bg-gray-900 rounded-3xl p-2">
                      <div className="bg-white rounded-2xl overflow-hidden">
                        {/* Status Bar */}
                        <div className="bg-gray-50 px-4 py-2 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                J
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">
                              JanBol
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <span>9:41 AM</span>
                            <div className="flex gap-1">
                              <div className="w-1 h-3 bg-green-500 rounded"></div>
                              <div className="w-1 h-3 bg-green-500 rounded"></div>
                              <div className="w-1 h-3 bg-green-500 rounded"></div>
                              <div className="w-1 h-3 bg-gray-300 rounded"></div>
                            </div>
                          </div>
                        </div>

                        {/* App Content */}
                        <div className="p-4 bg-gradient-to-b from-blue-50 to-white">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                              Report Issue
                            </h3>
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">+</span>
                            </div>
                          </div>

                          {/* Recent Reports */}
                          <div className="space-y-3">
                            {/* Report 1 */}
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-blue-100 flex items-center gap-3">
                              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-orange-600 text-lg">
                                  🚧
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  Road Damage
                                </div>
                                <div className="text-xs text-gray-500">
                                  Sector 15 • 2 days ago
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>

                            {/* Report 2 */}
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-blue-100 flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-lg">
                                  💡
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  Street Light
                                </div>
                                <div className="text-xs text-gray-500">
                                  Model Town • 5 days ago
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            </div>

                            {/* Report 3 */}
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-blue-100 flex items-center gap-3">
                              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-red-600 text-lg">🚰</span>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  Water Leak
                                </div>
                                <div className="text-xs text-gray-500">
                                  Civil Lines • 1 week ago
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="mt-4 flex gap-2">
                            <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium">
                              📷 Report Now
                            </button>
                            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                              📍
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Action Button */}
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center animate-pulse">
                      <span className="text-white text-xl">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Bar */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500 mb-2">
                  Partnered with leading organizations
                </p>
                <div className="flex items-center gap-8 opacity-60">
                  <div className="text-xs font-bold text-gray-600 px-3 py-1 border border-gray-300 rounded">
                    GOVT. OF PUNJAB
                  </div>
                  <div className="text-xs font-bold text-gray-600 px-3 py-1 border border-gray-300 rounded">
                    SMART CITY MISSION
                  </div>
                  <div className="text-xs font-bold text-gray-600 px-3 py-1 border border-gray-300 rounded">
                    DIGITAL INDIA
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>10K+ issues resolved this month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-blue-100 via-white to-blue-100"
      >
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How <span className="text-blue-600">JanBol</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Report civic issues in three simple steps and help build a better
              community
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 transform -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
              {/* Step 1 */}
              <div className="group">
                <div className="text-center">
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <span className="text-3xl">📸</span>
                    </div>
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      1
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-xl p-6 shadow-md group-hover:shadow-lg transition-all duration-300 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Capture the Issue
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Snap a photo of the problem you've spotted - from potholes
                      to broken streetlights
                    </p>
                    <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      <span className="text-sm font-medium">Quick & Easy</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group">
                <div className="text-center">
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <span className="text-3xl">📍</span>
                    </div>
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      2
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-xl p-6 shadow-md group-hover:shadow-lg transition-all duration-300 border border-green-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Tag Location
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Pin the exact location and add relevant details about the
                      issue for better context
                    </p>
                    <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      <span className="text-sm font-medium">GPS Enabled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group">
                <div className="text-center">
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <span className="text-3xl">🚀</span>
                    </div>
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      3
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-xl p-6 shadow-md group-hover:shadow-lg transition-all duration-300 border border-purple-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Submit Report
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Send your report directly to local authorities and track
                      its progress in real-time
                    </p>
                    <div className="mt-4 flex items-center justify-center space-x-2 text-purple-600">
                      <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                      <span className="text-sm font-medium">
                        Real-time Updates
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-md border border-blue-100">
              <span className="text-gray-600">Ready to make a difference?</span>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-blue-600">JanBol</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Built for citizens, by citizens. Experience transparent, efficient
              civic reporting with powerful tools designed to create real change
              in your community.
            </p>
          </div>

          {/* Main Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18h.01M8 21l4-7 4 7M3 7l18 0 -1.5 -4H4.5L3 7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Lightning Fast Reporting
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Submit comprehensive reports with photos, voice notes, or text
                in under 60 seconds. Our intuitive interface makes civic
                engagement effortless.
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Multi-format submissions
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Real-Time Progress Tracking
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Monitor your reports with live status updates, detailed
                timelines, and direct communication with responsible departments
                and officials.
              </p>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Live status dashboard
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-5 5-5-5h5V12h10v5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Notifications
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Stay informed with intelligent notifications via app, email, or
                SMS. Get updates when it matters most with customizable alert
                preferences.
              </p>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                Multi-channel alerts
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                GPS-Powered Location
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Automatically capture precise locations with our advanced GPS
                system. Add landmarks and detailed descriptions for pinpoint
                accuracy.
              </p>
              <div className="flex items-center text-orange-600 text-sm font-medium">
                <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                Precise geo-tagging
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-gradient-to-br from-teal-50 to-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-teal-100 hover:border-teal-200">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Community Engagement
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Connect with neighbors, support community issues, and see local
                impact metrics. Build stronger communities through collaborative
                civic action.
              </p>
              <div className="flex items-center text-teal-600 text-sm font-medium">
                <span className="w-2 h-2 bg-teal-600 rounded-full mr-2"></span>
                Social impact tracking
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-gradient-to-br from-rose-50 to-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-rose-100 hover:border-rose-200">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your data is protected with enterprise-grade security. Anonymous
                reporting options available while maintaining full transparency
                in the resolution process.
              </p>
              <div className="flex items-center text-rose-600 text-sm font-medium">
                <span className="w-2 h-2 bg-rose-600 rounded-full mr-2"></span>
                End-to-end encryption
              </div>
            </div>
          </div>

          {/* Additional Benefits Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                More Than Just Reporting
              </h3>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                JanBol is a comprehensive civic engagement platform designed to
                strengthen the connection between citizens and local government.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">
                  Analytics Dashboard
                </h4>
                <p className="text-blue-100 text-sm">
                  Track community trends and government responsiveness
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">
                  Achievement System
                </h4>
                <p className="text-blue-100 text-sm">
                  Earn badges for active civic participation
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌐</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">Multi-Language</h4>
                <p className="text-blue-100 text-sm">
                  Available in multiple local languages
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">Cross-Platform</h4>
                <p className="text-blue-100 text-sm">
                  Works seamlessly on mobile, tablet, and desktop
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600 font-medium">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Partner Cities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600 font-medium">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                2.5M
              </div>
              <div className="text-gray-600 font-medium">Active Citizens</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;
