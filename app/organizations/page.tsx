'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { organizationService, Organization } from '../../lib/services';
import { useAuthStore } from '../../lib/auth-store';
import { useToast, ToastContainer, LoadingSpinner } from '../../lib/ui-components';

export default function OrganizationsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, userEmail, setSelectedOrganization, setTokens, setOrg } = useAuthStore();
  const { toasts, addToast, removeToast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [createMode, setCreateMode] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);
  const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchOrganizations = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    try {
      setLoading(true);
      const data = await organizationService.getAll();
      setOrganizations(data);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to load organizations',
        message: (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'An unexpected error occurred.'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    fetchOrganizations();
  }, [isAuthenticated, isHydrated, router, fetchOrganizations]);

  const handleSelectOrganization = async (org: Organization) => {
    if (switchingOrgId) return;
    setSwitchingOrgId(org.id);
    
    try {
      const switchResponse = await organizationService.switch({ organizationId: org.id });
      setTokens(switchResponse.accessToken, switchResponse.refreshToken);
      setOrg(org.id, switchResponse.role);
      setSelectedOrganization(org.id, org.name);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 0);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to switch organization',
        message: (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'An unexpected error occurred.'
      });
      setSwitchingOrgId(null);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      addToast({
        type: 'warning',
        title: 'Organization name required',
        message: 'Please enter a name for your organization.'
      });
      return;
    }

    try {
      setCreating(true);
      const newOrg = await organizationService.create({ name: newOrgName.trim() });
      
      addToast({
        type: 'success',
        title: 'Organization created',
        message: `${newOrg.name} has been created successfully.`
      });

      setNewOrgName('');
      setCreateMode(false);
      hasFetched.current = false;
      await fetchOrganizations();
      
      handleSelectOrganization(newOrg);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to create organization',
        message: (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'An unexpected error occurred.'
      });
      setCreating(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="loading-screen">
        <div className="text-center">
          <div className="loading-logo mb-4">
            <span>T</span>
          </div>
          <p className="text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center slide-up">
          <div className="w-16 h-16 mx-auto mb-6 gradient-primary rounded-2xl flex items-center justify-center pulse-glow">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-secondary">Loading your organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background fade-in">
      <div className="max-w-5xl mx-auto px-6 py-12 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl shadow-2xl mb-6 pulse-glow">
            <span className="text-white font-bold text-3xl">T</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Welcome back{userEmail ? `, ${userEmail.split('@')[0]}` : ''}!
          </h1>
          <p className="text-lg text-secondary max-w-md mx-auto">
            Select an organization to continue or create a new one to get started
          </p>
        </div>

        {organizations.length > 0 ? (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSelectOrganization(org)}
                  disabled={switchingOrgId !== null}
                  className="card p-6 text-left hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    {switchingOrgId === org.id && (
                      <LoadingSpinner size="sm" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 truncate group-hover:text-primary transition-colors">
                    {org.name}
                  </h3>
                  <p className="text-sm text-muted">Click to access workspace</p>
                </button>
              ))}

              <button
                onClick={() => setCreateMode(true)}
                disabled={switchingOrgId !== null}
                className="card p-6 text-left border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 group transition-all duration-200 disabled:opacity-50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center text-primary font-bold text-3xl group-hover:bg-primary group-hover:text-white transition-all">
                    +
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Create New
                </h3>
                <p className="text-sm text-muted">Start a new organization</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-accent rounded-3xl flex items-center justify-center">
              <span className="text-4xl">🏢</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">No Organizations Yet</h2>
            <p className="text-secondary mb-8 max-w-md mx-auto">
              Get started by creating your first organization. You can manage projects, tasks, and team members within each organization.
            </p>
            <button
              onClick={() => setCreateMode(true)}
              className="btn-primary px-8 py-3 text-lg"
            >
              Create Your First Organization
            </button>
          </div>
        )}

        {createMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 fade-in">
            <div className="w-full max-w-md card shadow-2xl slide-up">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-xl font-semibold text-foreground">Create New Organization</h3>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Enter organization name"
                    className="input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateOrganization();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-border bg-accent/30">
                <button
                  onClick={() => {
                    setCreateMode(false);
                    setNewOrgName('');
                  }}
                  className="flex-1 btn-secondary"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrganization}
                  disabled={creating || !newOrgName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {creating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Organization'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
