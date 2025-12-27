'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { organizationService } from '../../lib/services';
import { useAuthStore } from '../../lib/auth-store';
import { useToast, ToastContainer, LoadingSpinner } from '../../lib/ui-components';

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated, selectedOrganizationId } = useAuthStore();
  const { addToast, toasts, removeToast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const acceptInvite = async () => {
      let token = searchParams.get('token');

      if (!token) {
        token = sessionStorage.getItem('pendingInviteToken');
        if (token) {
          sessionStorage.removeItem('pendingInviteToken');
        }
      }

      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid invite link - missing token');
        return;
      }

      if (!isHydrated) {
        return;
      }

      try {
        await organizationService.acceptInvite(token);
        setStatus('success');
        addToast({
          type: 'success',
          title: 'Invite accepted!',
          message: 'You have been successfully added to the organization.'
        });
        const redirectTo = selectedOrganizationId ? '/dashboard' : '/organizations';
        setTimeout(() => {
          router.replace(redirectTo);
        }, 2000);
      } catch (err) {
        if ((err as { response?: { status?: number } }).response?.status === 401) {
          sessionStorage.setItem('pendingInviteToken', token);
          router.replace('/login?redirect=accept-invite');
          return;
        }
        const errorMsg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error || (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message || 'Failed to accept invite. The invite may be expired or invalid.';
        if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('different email')) {
          setStatus('success');
          addToast({
            type: 'success',
            title: 'Invite processed!',
            message: 'You have been added to the organization or are already a member.'
          });
          const redirectTo = selectedOrganizationId ? '/dashboard' : '/organizations';
          setTimeout(() => {
            router.replace(redirectTo);
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage(errorMsg);
          addToast({
            type: 'error',
            title: 'Failed to accept invite',
            message: errorMsg
          });
        }
      }
    };

    acceptInvite();
  }, [searchParams, isAuthenticated, isHydrated, router, addToast, selectedOrganizationId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 sm:px-8 lg:px-12">
      <div className="card max-w-md w-full px-8 py-10 text-center shadow-lg">
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-6 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Processing Invite</h2>
            <p className="text-secondary">Please wait while we add you to the organization...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Invite Accepted!</h2>
            <p className="text-secondary mb-4">You&apos;ve been successfully added to the organization.</p>
            <p className="text-sm text-secondary">Redirecting to organizations...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Invite Error</h2>
            <p className="text-secondary mb-6">{errorMessage}</p>
            <button
              onClick={() => router.replace('/organizations')}
              className="btn-primary w-full"
            >
              Go to Organizations
            </button>
          </>
        )}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center px-6 sm:px-8 lg:px-12">
        <div className="card max-w-md w-full px-8 py-10 text-center shadow-lg">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
