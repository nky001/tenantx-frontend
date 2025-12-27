'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { authService } from '../../lib/services';
import { useToast, ToastContainer, LoadingSpinner } from '../../lib/ui-components';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast, toasts, removeToast } = useToast();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      await authService.resetPassword({ token, newPassword: data.newPassword });
      addToast({
        type: 'success',
        title: 'Password reset successful!',
        message: 'Your password has been updated. You can now sign in with your new password.'
      });
      setTimeout(() => {
        router.push('/login?message=Password reset successful! You can now sign in.');
      }, 2000);
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
                          (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
                          'Failed to reset password';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (error && !token) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-16 px-8 sm:px-12 lg:px-16 fade-in">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">!</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Invalid reset link
          </h2>
          <p className="mt-2 text-center text-sm text-secondary">
            {error}
          </p>
          <div className="mt-8 text-center">
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors">
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-16 px-8 sm:px-12 lg:px-16 fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-secondary">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
                New Password
              </label>
              <div className="mt-1">
                <input
                  {...register('newPassword')}
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-border rounded-lg placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground transition-colors"
                  placeholder="••••••••"
                />
                {errors.newPassword && <p className="mt-2 text-sm text-red-500">{errors.newPassword.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-border rounded-lg placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground transition-colors"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center py-3"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Resetting password...
                  </div>
                ) : (
                  'Reset password'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link href="/login" className="text-sm text-primary hover:text-primary-dark transition-colors">
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}