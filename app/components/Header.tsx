'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../lib/auth-store';
import { authService } from '../../lib/services';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { isAuthenticated, userName, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (_error) {
    } finally {
      logout();
      router.push('/');
    }
  };

  const getAvatar = () => {
    if (!userName) return '?';
    const firstName = userName.split(' ')[0];
    return firstName.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (!userName) return '';
    return userName.split(' ')[0];
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-foreground">TenantX</span>
            </Link>
          </div>


          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getAvatar()}
                </div>
                <span className="text-sm text-foreground font-medium hidden sm:block">{getDisplayName()}</span>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-secondary hover:text-foreground font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-primary py-2 px-4 text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}