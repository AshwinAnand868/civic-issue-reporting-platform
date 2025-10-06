function About() {
  return (
    <div>
      <section
        id="about"
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* About Section */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                Our Story
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About <span className="text-blue-600">JanBol</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Bridging the gap between citizens and government through
                technology, transparency, and collaborative action.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: Story Content */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Empowering Every Voice
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    JanBol was born from a simple belief: every citizen deserves
                    to be heard, and every civic issue deserves attention. We've
                    created India's most comprehensive platform for civic
                    engagement, transforming how communities interact with local
                    government.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    From bustling metropolises to growing towns, we prioritize
                    clarity, accountability, and measurable outcomes that make
                    real differences in people's daily lives.
                  </p>
                </div>

                {/* Mission Values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Transparency
                    </h4>
                    <p className="text-sm text-gray-600">
                      Open processes and clear communication at every step
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl shadow-sm border border-green-100">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Action</h4>
                    <p className="text-sm text-gray-600">
                      Fast response times and measurable outcomes
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Community
                    </h4>
                    <p className="text-sm text-gray-600">
                      Building stronger neighborhoods through collaboration
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl shadow-sm border border-orange-100">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Accountability
                    </h4>
                    <p className="text-sm text-gray-600">
                      Holding authorities responsible for public services
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Visual Elements */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full"></div>
                    <div className="absolute bottom-8 left-8 w-24 h-24 border-2 border-white rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-6">Our Impact</h3>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-1">2.5M+</div>
                        <div className="text-blue-100 text-sm">
                          Active Citizens
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-1">50+</div>
                        <div className="text-blue-100 text-sm">
                          Partner Cities
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-1">10K+</div>
                        <div className="text-blue-100 text-sm">
                          Issues Resolved
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-1">95%</div>
                        <div className="text-blue-100 text-sm">
                          Satisfaction Rate
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <p className="text-sm text-blue-100 italic">
                        "JanBol has revolutionized how our city handles civic
                        issues. Response times improved by 60% in just six
                        months."
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-xs">👨‍💼</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            Rajesh Kumar
                          </div>
                          <div className="text-xs text-blue-200">
                            Municipal Commissioner
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gray-900 rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 to-purple-600"></div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Get In Touch
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Ready to bring JanBol to your community? Let's build better
                  cities together.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {/* Email */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Get in touch for partnerships
                  </p>
                  <a
                    href="mailto:hello@janbol.example"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    hello@janbol.example
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>

                {/* Support */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Support</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Need help with the platform?
                  </p>
                  <a
                    href="mailto:support@janbol.example"
                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium"
                  >
                    support@janbol.example
                  </a>
                </div>

                {/* Partnerships */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V6m8 0H8m0 0v.01M8 6v6h8V6"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Partnerships</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Government & NGO collaborations
                  </p>
                  <a
                    href="mailto:partnerships@janbol.example"
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium"
                  >
                    partnerships@janbol.example
                  </a>
                </div>

                {/* Press */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Press & Media</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Media inquiries & resources
                  </p>
                  <a
                    href="mailto:press@janbol.example"
                    className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium"
                  >
                    press@janbol.example
                  </a>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4">
                  <span className="text-gray-300">
                    Ready to transform your city?
                  </span>
                  <a
                    href="mailto:hello@janbol.example?subject=Partnership Inquiry"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200"
                  >
                    Start Conversation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
