'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../lib/auth-store';
import { organizationService, Organization } from '../../lib/services';

export default function OrganizationSwitcher() {
  const { organizationId, setOrg, setTokens } = useAuthStore();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchOrganizations = async () => {
    try {
      const data = await organizationService.getAll();
      setOrgs(data);
        } catch (_err) {
    }
  };

  const handleSwitch = async (orgId: string) => {
    if (orgId === organizationId) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(false);
    try {
      const data = await organizationService.switch({ organizationId: orgId });
      setTokens(data.accessToken, data.refreshToken);
      setOrg(orgId, data.role);
      window.location.reload();
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  if (orgs.length === 0) {
    return (
      <div className="text-sm text-secondary px-3 py-1.5 bg-secondary/20 rounded-lg border border-border">
        No organizations
      </div>
    );
  }

  if (orgs.length === 1) {
    const org = orgs[0];
    return (
      <div className="text-sm font-medium text-foreground px-3 py-1.5 bg-background rounded-lg border border-border flex items-center gap-2">
        <div className="w-2 h-2 bg-primary rounded-full"></div>
        <span className="truncate max-w-[120px] sm:max-w-[150px]">{org.name}</span>
      </div>
    );
  }

  const activeOrg = orgs.find(org => org.id === organizationId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors disabled:opacity-50 min-w-[120px] sm:min-w-[150px]"
      >
        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
        <span className="text-sm font-medium text-foreground truncate flex-1 text-left">
          {activeOrg?.name || 'Select org'}
        </span>
        {loading ? (
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0"></div>
        ) : (
          <svg
            className={`w-4 h-4 text-secondary transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 w-full min-w-[200px] bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="py-1">
            {orgs.map((org) => {
              const isActive = org.id === organizationId;
              return (
                <button
                  key={org.id}
                  onClick={() => handleSwitch(org.id)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-secondary/50 transition-colors flex items-center gap-3 ${
                    isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-primary' : 'bg-secondary'}`}></div>
                  <span className="truncate">{org.name}</span>
                  {isActive && (
                    <svg className="w-4 h-4 text-primary ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
