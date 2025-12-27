'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { authService } from '../../lib/services';
import { useToast, ToastContainer, LoadingSpinner } from '../../lib/ui-components';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast, toasts, removeToast } = useToast();

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    try {
      await authService.forgotPassword({ email: data.email });
      setSubmitted(true);
      addToast({
        type: 'success',
        title: 'Reset email sent!',
        message: 'Check your email for password reset instructions.'
      });
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
                          (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
                          'Failed to send reset email';
      addToast({
        type: 'error',
        title: 'Failed to send reset email',
        message: typeof errorMessage === 'string' ? errorMessage : 'An unexpected error occurred.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-16 px-8 sm:px-12 lg:px-16 fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-secondary">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          {!submitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-3 border border-border rounded-lg placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground transition-colors"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center py-3"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Sending reset email...
                    </div>
                  ) : (
                    'Send reset email'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-sm text-primary hover:text-primary-dark transition-colors">
                  Back to sign in
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">Check your email</h3>
                <p className="mt-2 text-sm text-secondary">
                  We&apos;ve sent a password reset link to <strong>{getValues('email')}</strong>
                </p>
              </div>
              <div className="text-center">
                <Link href="/login" className="text-sm text-primary hover:text-primary-dark transition-colors">
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}