'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../lib/services';
import { content } from '../../lib/content';
import { useToast, ToastContainer, LoadingSpinner } from '../../lib/ui-components';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [success] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const router = useRouter();
  const { addToast, toasts, removeToast } = useToast();
  const { register: registerContent } = content.auth;

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // Countdown timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      await authService.register({
        email: data.email,
        name: data.name,
        password: data.password,
      });

      setRegisteredEmail(data.email);
      setOtpStep(true);
      addToast({
        type: 'success',
        title: 'Registration initiated!',
        message: 'Please check your email for the OTP to complete registration.'
      });
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
                          (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
                          (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data ||
                          'Registration failed';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.verifyOtp({
        email: registeredEmail,
        otp: otp.trim(),
      });

      addToast({
        type: 'success',
        title: 'Verification successful!',
        message: 'Your account has been verified. You can now log in.'
      });

      setTimeout(() => {
        router.push('/login?message=Account verified successfully! You can now log in.');
      }, 2000);
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
                          (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
                          (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data ||
                          'Verification failed';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const onResendOtp = async () => {
    setResendLoading(true);
    setError('');
    try {
      await authService.resendOtp({
        email: registeredEmail,
      });

      addToast({
        type: 'success',
        title: 'OTP sent!',
        message: 'A new OTP has been sent to your email.'
      });
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
                          (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
                          (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data ||
                          'Failed to resend OTP';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
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
          {registerContent.title}
        </h2>
        <p className="mt-2 text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="card px-8 py-8">
          {!otpStep ? (
            <form className="space-y-6">
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
                  placeholder={registerContent.emailPlaceholder}
                />
                {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-border rounded-lg placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground transition-colors"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="mt-1">
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-border rounded-lg placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground transition-colors"
                  placeholder={registerContent.passwordPlaceholder}
                />
                {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-border rounded-lg placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground transition-colors"
                  placeholder={registerContent.confirmPasswordPlaceholder}
                />
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-700 dark:text-green-400">{success}</div>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center py-3"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    {registerContent.signingUp}
                  </div>
                ) : (
                  registerContent.submitButton
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-secondary">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled
                title="This is just a project so we are taking this down for now"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-border rounded-lg shadow-sm bg-background text-sm font-medium text-foreground opacity-50 cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled
                title="This is just a project so we are taking this down for now"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-border rounded-lg shadow-sm bg-background text-sm font-medium text-foreground opacity-50 cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                GitHub
              </button>
            </div>

            <div className="text-center">
              <Link href="/login" className="text-sm text-primary hover:text-primary-dark transition-colors">
                {registerContent.signInLink}
              </Link>
            </div>
          </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">Check your email</h3>
                <p className="mt-2 text-sm text-secondary">
                  We&apos;ve sent a verification code to <strong>{getValues('email')}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-foreground">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="appearance-none block w-full px-3 py-3 border border-border rounded-lg placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground transition-colors text-center text-lg font-mono tracking-widest"
                    placeholder="000000"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                  <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-700 dark:text-green-400">{success}</div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center py-3"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <button
                  type="button"
                  onClick={onResendOtp}
                  disabled={resendLoading || resendDisabled}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-border rounded-lg shadow-sm bg-background text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Sending...
                    </div>
                  ) : resendDisabled ? (
                    `Resend in ${resendCountdown}s`
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  Back to registration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}