'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService, LoginRequest } from '../../lib/services';
import { useAuthStore } from '../../lib/auth-store';
import { useToast, ToastContainer, LoadingSpinner } from '../../lib/ui-components';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState('');
  const [success] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('message') || '';
    }
    return '';
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast, toasts, removeToast } = useToast();
  const { setTokens, isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated) {
      router.replace('/organizations');
    }
  }, [isAuthenticated, isHydrated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
      };
      const response = await authService.login(loginData);
      setTokens(response.accessToken, response.refreshToken);

      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'Login successful'
      });

      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      const redirectUrl = redirect === 'accept-invite' ? '/accept-invite' : '/organizations';
      router.replace(redirectUrl);
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
                          (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
                          'Login failed';

      addToast({
        type: 'error',
        title: 'Login failed',
        message: typeof errorMessage === 'string' ? errorMessage : 'An unexpected error occurred.'
      });

      setError(typeof errorMessage === 'string' ? errorMessage : 'Login failed');
      setLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="loading-screen">
        <div className="text-center">
          <div className="loading-logo mb-4">
            <span>T</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-8">
            <span className="text-white font-bold text-3xl">T</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6">
            Welcome to TenantX
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-md">
            A small demo app for exploring multi-tenant orgs, projects, and tasks.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Multi-tenant data isolation</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Role-based access control</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>JWT auth + basic roles</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mb-48" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-16 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Sign in to your account
            </h2>
            <p className="text-secondary">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:text-primary-dark font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 text-success">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20">
              <div className="flex items-center gap-2 text-error">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm text-secondary">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled
                title="This is just a project so we are taking this down for now"
                className="btn-secondary flex items-center justify-center gap-2 py-2.5 opacity-50 cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled
                title="This is just a project so we are taking this down for now"
                className="btn-secondary flex items-center justify-center gap-2 py-2.5 opacity-50 cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                GitHub
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-primary-dark">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary-dark">Privacy Policy</Link>
          </p>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}