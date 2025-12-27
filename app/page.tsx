'use client';

import Link from 'next/link';
import { useAuthStore } from '../lib/auth-store';
import { content } from '../lib/content';

export default function LandingPage() {
  const { isAuthenticated, isHydrated, isVerifying } = useAuthStore();
  const { title, subtitle, description, signInButton, signUpButton, features } = content.landing;

  if (!isHydrated || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <span className="text-white font-bold text-3xl">T</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
              {title}
            </h1>
            <h2 className="text-xl md:text-2xl text-primary mb-8 font-semibold">
              {subtitle}
            </h2>
            <p className="text-lg md:text-xl text-secondary mb-12 max-w-4xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-primary text-lg px-8 py-4 rounded-xl"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn-primary text-lg px-8 py-4 rounded-xl"
                >
                  {signUpButton}
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary text-lg px-8 py-4 rounded-xl"
                >
                  {signInButton}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-accent">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {features.title}
            </h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              A small demo project focused on multi-tenant patterns
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.items.map((feature, index) => (
              <div key={index} className="card p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <div className="w-8 h-8 bg-white rounded-lg"></div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent text-foreground py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="text-2xl font-bold">TenantX</span>
              </div>
              <p className="text-secondary mb-4 max-w-md">
                A learning project that demonstrates multi-tenant org/project/task flows.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Project</h3>
              <ul className="space-y-2 text-secondary">
                <li><a href="#features" className="hover:text-primary">Features</a></li>
                <li><a href="https://github.com/nky001/tenantx-backend" className="hover:text-primary">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Notes</h3>
              <ul className="space-y-2 text-secondary">
                <li><span className="text-secondary">Built for learning</span></li>
                <li><span className="text-secondary">Not a production app</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-secondary">
            <p>&copy; 2025 TenantX Project</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
