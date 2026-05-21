'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MapPin, Users, Calendar, Zap, Shield, Star, ArrowRight, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-surface-900">Hometown Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/auth/register" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-surface-200 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-3.5 h-3.5" />
            Now in beta — join your community today
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-surface-900 leading-tight mb-6 animate-slide-up">
            Connect with{' '}
            <span className="text-primary-500">your hometown</span>,{' '}
            digitally.
          </h1>

          <p className="text-xl text-surface-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Discover local communities, attend neighborhood events, and build meaningful connections with the people around you.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center animate-slide-up">
            <Link href="/auth/register" className="btn-primary text-base px-8 py-3 shadow-brand">
              Join your community
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login" className="btn-secondary text-base px-8 py-3">
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-surface-200">
            {[
              { value: '10K+', label: 'Members' },
              { value: '500+', label: 'Communities' },
              { value: '2K+', label: 'Events' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-surface-900">{stat.value}</div>
                <div className="text-sm text-surface-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-surface-900 mb-4">
              Everything your community needs
            </h2>
            <p className="text-surface-500 text-lg max-w-2xl mx-auto">
              A complete platform built for neighborhoods, interest groups, and local organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Communities',
                desc: 'Create or join communities around your neighborhood, interests, or local causes.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: 'Events',
                desc: 'Discover and attend local events. RSVP and stay updated on what\'s happening nearby.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: <MessageCircle className="w-6 h-6" />,
                title: 'Discussions',
                desc: 'Post updates, share news, and discuss topics that matter to your community.',
                color: 'bg-primary-50 text-primary-600',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Real-time',
                desc: 'Get instant notifications for replies, likes, and community activity as it happens.',
                color: 'bg-yellow-50 text-yellow-600',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Moderation',
                desc: 'Community moderators and admins keep your spaces safe and on-topic.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: 'Profiles',
                desc: 'Build your community profile, follow neighbors, and track your local contributions.',
                color: 'bg-pink-50 text-pink-600',
              },
            ].map((feat) => (
              <div key={feat.title} className="card p-6 hover:-translate-y-1 transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center mb-4`}>
                  {feat.icon}
                </div>
                <h3 className="font-semibold text-surface-900 text-lg mb-2">{feat.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="gradient-brand rounded-3xl p-12 text-white shadow-brand">
            <h2 className="font-display text-4xl font-bold mb-4">
              Ready to find your community?
            </h2>
            <p className="text-primary-100 text-lg mb-8">
              Join thousands of neighbors already connecting on Hometown Hub.
            </p>
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors">
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-surface-200 text-center text-sm text-surface-500">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 gradient-brand rounded-md flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <span className="font-display font-bold text-surface-900">Hometown Hub</span>
        </div>
        <p>© {new Date().getFullYear()} Hometown Hub. Built with ❤️ for communities.</p>
      </footer>
    </div>
  );
}
