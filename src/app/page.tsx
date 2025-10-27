import Image from "next/image";
import Link from "next/link";
import { FEATURES, FOOTER_LINKS, HOW_IT_WORKS_STEPS, SITE } from "@/lib/content";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="px-6 sm:px-10 py-6 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image src="/logo.png" alt="RED Lecithin logo" width={50} height={50} priority className="rounded-xl shadow-sm" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">{SITE.name}</span>
              <div className="text-sm text-slate-600 font-medium">redlecithin.online</div>
            </div>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3 text-sm font-semibold hover:from-slate-800 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            {SITE.ctaLabel}
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-transparent to-slate-900/10"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-blue-100/50 to-purple-100/30 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 sm:py-32 relative">
            <div className="flex flex-col items-center text-center gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 to-slate-900/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-slate-200/50">
                  <Image src="/logo.png" alt="RED Lecithin logo" width={120} height={120} priority className="rounded-2xl" />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/5 border border-slate-200/50 rounded-full text-sm font-medium text-slate-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Internal Company Platform
                </div>
                
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900">
                  <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                    {SITE.tagline}
                  </span>
                </h1>
                
                <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
                  {SITE.description}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-6 mt-8">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-4 text-lg font-semibold hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    {SITE.ctaLabel}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-3 rounded-2xl bg-white border-2 border-slate-900 text-slate-900 px-8 py-4 text-lg font-semibold hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login
                  </Link>
                </div>
                
                <div className="text-sm text-slate-500 text-center">
                  <div className="font-medium">Secure Access Portal</div>
                  <div>Use your credentials to access the platform</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-6 sm:px-10 py-20 sm:py-32">
            <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Platform Capabilities</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive business automation tools designed for operational excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => {
              const icons = [
                // Questionnaire icon
                <svg key="q" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>,
                // COA icon
                <svg key="c" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>,
                // Analytics icon
                <svg key="a" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ];
              
              return (
                <div key={feature.title} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 to-slate-900/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-white border border-slate-200/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-slate-300/50">
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl shadow-lg">
                        {icons[index]}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                    
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="inline-flex items-center text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        Learn more
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50/50 to-transparent rounded-full blur-3xl"></div>
          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-20 sm:py-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Streamlined Workflow</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Simple, efficient process designed for maximum productivity and minimal complexity
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {HOW_IT_WORKS_STEPS.map((step, idx) => (
                <div key={step} className="relative group">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 to-slate-900/5 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-xl group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{step}</h3>
                    <p className="text-sm text-slate-600">
                      {idx === 0 && "Select and upload your documents"}
                      {idx === 1 && "AI processes and extracts data"}
                      {idx === 2 && "Review and validate results"}
                      {idx === 3 && "Export in your preferred format"}
                    </p>
                    
                    {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-8 text-slate-300">
                        <svg className="w-full h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-slate-200/50 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Logo and Company Info */}
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="RED Lecithin logo" width={40} height={40} className="rounded-lg" />
              <div>
                <div className="font-bold text-slate-900">{SITE.name}</div>
                <div className="text-sm text-slate-600">redlecithin.online</div>
              </div>
            </div>
            
            {/* Links */}
            <nav className="flex items-center gap-8">
              {FOOTER_LINKS.map((link) => (
                <Link key={link.label} href={link.href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  {link.label}
                </Link>
              ))}
            </nav>
            
            {/* Copyright */}
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} RedLecithin. All rights reserved.
            </div>
          </div>
          
          {/* Security Notice */}
          <div className="mt-8 pt-8 border-t border-slate-200/50 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/5 border border-slate-200/50 rounded-full text-xs font-medium text-slate-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              This is a secure platform for authorized personnel only
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
