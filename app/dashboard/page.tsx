'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  organizationService,
  projectService,
  taskService,
  Organization,
  Project,
  Task,
  Member
} from '../../lib/services';
import { useAuthStore } from '../../lib/auth-store';
import { content } from '../../lib/content';
import {
  EnhancedModal,
  EnhancedStatCard,
  EnhancedEmptyState,
  ConfirmationDialog,
  useToast,
  ToastContainer
} from '../../lib/ui-components';

const { dashboard } = content;
type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <EnhancedModal open={open} title={title} onClose={onClose}>
      {children}
    </EnhancedModal>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <EnhancedStatCard label={label} value={value} accent={accent} />
  );
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <EnhancedEmptyState title={title} description={description} action={action} />
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const {
    isAuthenticated,
    isHydrated,
    selectedOrganizationId,
    selectedOrganizationName,
    role,
  } = useAuthStore();
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [projectCreateName, setProjectCreateName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

  // Confirmation dialog states
  const [removeMemberConfirm, setRemoveMemberConfirm] = useState<{ open: boolean; userId: string; userEmail: string }>({ open: false, userId: '', userEmail: '' });

  interface PendingInvite {
    id: string;
    email: string;
    role: string;
    invitedAt: string;
  }

  const activeProject = useMemo(() => projects.find((project) => project.id === selectedProject) ?? null, [projects, selectedProject]);

  const fetchProjects = useCallback(async (orgId: string) => {
    try {
      const data = await projectService.getAll(orgId);
      setProjects(data);
      if (data.length === 0) {
        setSelectedProject(null);
      } else if (!selectedProject || !data.some((project) => project.id === selectedProject)) {
        setSelectedProject(data[0].id);
      }
    } catch (_err) {
      setProjects([]);
      setSelectedProject(null);
    }
  }, [selectedProject]);

  const fetchTasks = useCallback(async (projectId: string) => {
    try {
      const data = await taskService.getByProject(projectId);
      setTasks(data);
    } catch (_err) {
      setTasks([]);
    }
  }, []);

  const fetchMembers = useCallback(async (orgId: string) => {
    try {
      const data = await organizationService.getMembers(orgId);
      setMembers(data);
    } catch (_err) {
      setMembers([]);
    }
  }, []);

  const fetchPendingInvites = useCallback(async (orgId: string) => {
    try {
      const data = await organizationService.getPendingInvites(orgId);
      setPendingInvites(data);
    } catch (_err) {
      setPendingInvites([]);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    const bootstrap = async () => {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      if (!selectedOrganizationId) {
        router.replace('/organizations');
        return;
      }

      try {
        setCurrentOrg({ id: selectedOrganizationId, name: selectedOrganizationName || 'Unknown' });
        
        await Promise.all([
          fetchProjects(selectedOrganizationId),
          fetchMembers(selectedOrganizationId),
          fetchPendingInvites(selectedOrganizationId)
        ]);
      } catch (_err) {
        addToast({
          type: 'error',
          title: 'Failed to load dashboard',
          message: 'Please try again.'
        });
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [isAuthenticated, isHydrated, selectedOrganizationId, selectedOrganizationName, router, addToast, fetchProjects, fetchMembers, fetchPendingInvites]);

  useEffect(() => {
    if (!currentOrg) {
      setProjects([]);
      setMembers([]);
      setPendingInvites([]);
      setTasks([]);
      setSelectedProject(null);
      return;
    }
    fetchProjects(currentOrg.id);
    fetchMembers(currentOrg.id);
    fetchPendingInvites(currentOrg.id);
  }, [currentOrg, fetchProjects, fetchMembers, fetchPendingInvites]);

  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }
    fetchTasks(selectedProject);
  }, [selectedProject, fetchTasks]);

  const createProject = async () => {
    if (!currentOrg || !projectCreateName.trim()) return;
    setActionLoading(true);
    try {
      const data = await projectService.create({ name: projectCreateName.trim() });
      setProjectCreateName('');
      setCreateProjectOpen(false);
      await fetchProjects(currentOrg.id);
      setSelectedProject(data.id);
      addToast({
        type: 'success',
        title: 'Project created',
        message: 'The project has been successfully created.'
      });
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 403) {
        addToast({
          type: 'error',
          title: 'Failed to create project',
          message: 'Please try again.'
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const createTask = async () => {
    if (!selectedProject || !taskTitle.trim()) return;
    setActionLoading(true);
    try {
      await taskService.create({
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        projectId: selectedProject,
      });
      setTaskTitle('');
      setTaskDescription('');
      setCreateTaskOpen(false);
      await fetchTasks(selectedProject);
      addToast({
        type: 'success',
        title: 'Task created',
        message: 'The task has been successfully created.'
      });
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 403) {
        addToast({
          type: 'error',
          title: 'Failed to create task',
          message: 'Please try again.'
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!currentOrg || !inviteEmail.trim()) return;

    if (members.some((member) => member.email === inviteEmail.trim())) {
      addToast({
        type: 'error',
        title: 'Already a member',
        message: 'User is already a member of this organization.'
      });
      return;
    }

    if (pendingInvites.some((invite) => invite.email === inviteEmail.trim())) {
      addToast({
        type: 'error',
        title: 'Invitation already sent',
        message: 'An invitation has already been sent to this email.'
      });
      return;
    }

    setActionLoading(true);
    try {
      await organizationService.inviteMember(currentOrg.id, { 
        email: inviteEmail.trim(), 
        role: inviteRole 
      });
      setInviteEmail('');
      setInviteRole('MEMBER');
      await fetchMembers(currentOrg.id);
      await fetchPendingInvites(currentOrg.id);
      addToast({
        type: 'success',
        title: 'Invitation sent',
        message: 'The invitation has been successfully sent.'
      });
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 403) {
        addToast({
          type: 'error',
          title: 'Failed to send invitation',
          message: 'Please try again.'
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const revokeInvite = async (inviteId: string) => {
    if (!currentOrg) return;
    setActionLoading(true);
    try {
      await organizationService.revokeInvite(currentOrg.id, inviteId);
      await fetchPendingInvites(currentOrg.id);
      addToast({
        type: 'success',
        title: 'Invitation revoked',
        message: 'The invitation has been successfully revoked.'
      });
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 403) {
        addToast({
          type: 'error',
          title: 'Failed to revoke invitation',
          message: 'Please try again.'
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const changeMemberRole = async (userId: string, role: string) => {
    if (!currentOrg) return;
    try {
      await organizationService.changeMemberRole(currentOrg.id, userId, { role });
      await fetchMembers(currentOrg.id);
      addToast({
        type: 'success',
        title: 'Role updated',
        message: 'The member role has been successfully updated.'
      });
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 403) {
        addToast({
          type: 'error',
          title: 'Failed to update role',
          message: 'Please try again.'
        });
      }
    }
  };

  const removeMember = async () => {
    if (!currentOrg || !removeMemberConfirm.userId) return;
    try {
      await organizationService.removeMember(currentOrg.id, removeMemberConfirm.userId);
      setRemoveMemberConfirm({ open: false, userId: '', userEmail: '' });
      await fetchMembers(currentOrg.id);
      addToast({
        type: 'success',
        title: 'Member removed',
        message: 'The member has been successfully removed from the organization.'
      });
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status !== 403) {
        addToast({
          type: 'error',
          title: 'Failed to remove member',
          message: (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'An unexpected error occurred.'
        });
      }
    }
  };

  const handleRemoveMemberClick = (userId: string, userEmail: string) => {
    setRemoveMemberConfirm({ open: true, userId, userEmail });
  };

  const handleSwitchOrganization = () => {
    router.push('/organizations');
  };

  if (!isHydrated || initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="card px-8 py-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm font-medium text-secondary">{dashboard.loadingDashboard}</p>
        </div>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const totalProjects = projects.length;
  const totalMembers = members.length;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
        {/* Organization Header */}
        <div className="mb-8 flex items-center justify-between card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {currentOrg?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{currentOrg?.name}</h1>
              <p className="text-sm text-secondary">Role: {role || 'MEMBER'}</p>
            </div>
          </div>
          <button
            onClick={handleSwitchOrganization}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01" />
            </svg>
            Switch Organization
          </button>
        </div>

        <section className="grid gap-5 md:grid-cols-3">
          <StatCard label={dashboard.projectsLabel} value={totalProjects} accent="from-purple-500 to-fuchsia-500" />
          <StatCard label={dashboard.tasksLabel} value={totalTasks} accent="from-teal-500 to-emerald-500" />
          <StatCard label="Team Members" value={totalMembers} accent="from-blue-500 to-indigo-500" />
        </section>

        <section className="mt-10 space-y-6">
            <div className="card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">{dashboard.projectsLabel}</h2>
                {(role === 'ORG_ADMIN' || role === 'MANAGER') && (
                  <button
                    onClick={() => setCreateProjectOpen(true)}
                    disabled={!currentOrg}
                    className={`btn-primary text-sm ${!currentOrg ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {dashboard.createProjectButton}
                  </button>
                )}
              </div>
              {currentOrg ? (
                projects.length > 0 ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {projects.map((project) => {
                      const isActive = project.id === selectedProject;
                      return (
                        <button
                          key={project.id}
                          onClick={() => setSelectedProject(project.id)}
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${isActive ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-border bg-card text-foreground hover:border-primary hover:bg-primary/5'}`}
                        >
                          <p className="text-sm font-semibold">{project.name}</p>
                          <p className="mt-2 text-xs text-secondary">{dashboard.projectSubtitle}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title={dashboard.noProjects}
                    description={dashboard.noProjectsSubtitle}
                    action={
                      (role === 'ORG_ADMIN' || role === 'MANAGER') ? (
                        <button
                          onClick={() => setCreateProjectOpen(true)}
                          className="btn-primary"
                        >
                          {dashboard.createProjectButton}
                        </button>
                      ) : undefined
                    }
                  />
                )
              ) : (
                <EmptyState
                  title={dashboard.selectOrgTitle}
                  description={dashboard.selectOrgSubtitle}
                />
              )}
            </div>

            <div className="card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">{dashboard.tasksLabel}</h2>
                <button
                  onClick={() => setCreateTaskOpen(true)}
                  disabled={!activeProject}
                  className={`btn-primary text-sm ${!activeProject ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {dashboard.createTaskButton}
                </button>
              </div>
              {activeProject ? (
                tasks.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="card p-4 hover:border-primary hover:bg-primary/5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{task.title}</p>
                            <p className="mt-1 text-xs font-medium text-primary">{task.status}</p>
                            {task.description && <p className="mt-2 text-xs text-secondary">{task.description}</p>}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {task.status !== 'COMPLETED' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await taskService.complete(task.id);
                                    if (activeProject) {
                                      await fetchTasks(activeProject.id);
                                    }
                                    addToast({
                                      type: 'success',
                                      title: 'Task completed',
                                      message: `${task.title} marked as complete.`
                                    });
                                  } catch (err) {
                                    const status = (err as { response?: { status?: number } })?.response?.status;
                                    if (status !== 403) {
                                      const errorMsg = (err as { response?: { data?: string } })?.response?.data || 'Failed to complete task';
                                      addToast({
                                        type: 'error',
                                        title: 'Failed to complete task',
                                        message: typeof errorMsg === 'string' ? errorMsg : 'Please try again.'
                                      });
                                    }
                                  }
                                }}
                                className="text-xs px-3 py-1 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                                title="Mark as complete"
                              >
                                ✓
                              </button>
                            )}
                            {task.status !== 'DISCONTINUED' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await taskService.discontinue(task.id);
                                    if (activeProject) {
                                      await fetchTasks(activeProject.id);
                                    }
                                    addToast({
                                      type: 'success',
                                      title: 'Task discontinued',
                                      message: `${task.title} has been discontinued.`
                                    });
                                  } catch (err) {
                                    const status = (err as { response?: { status?: number } })?.response?.status;
                                    if (status !== 403) {
                                      const errorMsg = (err as { response?: { data?: string } })?.response?.data || 'Failed to discontinue task';
                                      addToast({
                                        type: 'error',
                                        title: 'Failed to discontinue task',
                                        message: typeof errorMsg === 'string' ? errorMsg : 'Please try again.'
                                      });
                                    }
                                  }
                                }}
                                className="text-xs px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                                title="Discontinue task"
                              >
                                ⊘
                              </button>
                            )}
                            {(role === 'ORG_ADMIN' || role === 'MANAGER') && (
                              <button
                                onClick={async () => {
                                  try {
                                    await taskService.delete(task.id);
                                    if (activeProject) {
                                      await fetchTasks(activeProject.id);
                                    }
                                    addToast({
                                      type: 'success',
                                      title: 'Task deleted',
                                      message: `${task.title} has been permanently deleted.`
                                    });
                                  } catch (_err) {
                                    addToast({
                                      type: 'error',
                                      title: 'Failed to delete task',
                                      message: 'Please try again.'
                                    });
                                  }
                                }}
                                className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                                title="Delete task"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={dashboard.noTasks}
                    description={dashboard.noTasksSubtitle}
                    action={
                      <button
                        onClick={() => setCreateTaskOpen(true)}
                        className="btn-primary"
                      >
                        {dashboard.createTaskButton}
                      </button>
                    }
                  />
                )
              ) : (
                <EmptyState
                  title={dashboard.selectProjectTitle}
                  description={dashboard.selectProjectSubtitle}
                />
              )}
            </div>

            {currentOrg && (
              <div className="card p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">{dashboard.membersTitle}</h2>
                  {(role === 'ORG_ADMIN' || role === 'MANAGER') && (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(event) => setInviteEmail(event.target.value)}
                        placeholder={dashboard.invitePlaceholder}
                        className="input w-48 text-xs"
                      />
                      <select
                        value={inviteRole}
                        onChange={(event) => setInviteRole(event.target.value)}
                        className="input text-xs"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ORG_ADMIN">Admin</option>
                      </select>
                      <button
                        onClick={inviteMember}
                        className="btn-primary text-xs"
                      >
                        {dashboard.inviteButton}
                      </button>
                    </div>
                  )}
                </div>
                {members.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {members.map((member) => {
                      const isCurrentUser = member.email === useAuthStore.getState().userEmail;
                      const isOwner = isCurrentUser && member.role === 'ORG_ADMIN';
                      return (
                        <div key={member.userId} className="card px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {member.email}
                              {isCurrentUser && <span className="ml-2 text-xs text-primary">(You)</span>}
                            </p>
                            <p className="text-xs text-secondary">{member.role}</p>
                          </div>
                          {(role === 'ORG_ADMIN' || role === 'MANAGER') && (
                            <div className="flex items-center gap-2">
                              <select
                                value={member.role}
                                onChange={(event) => changeMemberRole(member.userId, event.target.value)}
                                className="input text-xs"
                                disabled={isOwner}
                              >
                                <option value="MEMBER">Member</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ORG_ADMIN">Admin</option>
                              </select>
                              <button
                                onClick={() => handleRemoveMemberClick(member.userId, member.email)}
                                className="btn-danger text-xs"
                                disabled={isCurrentUser}
                              >
                                {dashboard.removeButton}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title={dashboard.noMembers}
                    description={dashboard.noMembersSubtitle}
                  />
                )}

                {(role === 'ORG_ADMIN' || role === 'MANAGER') && pendingInvites.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-foreground">Pending Invites</h3>
                    <div className="mt-3 space-y-3">
                      {pendingInvites.map((invite) => (
                        <div key={invite.id} className="card-warning px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{invite.email}</p>
                            <p className="text-xs text-secondary">{invite.role} - Invited {new Date(invite.invitedAt).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => revokeInvite(invite.id)}
                            className="btn-danger text-xs"
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
        </section>
      </main>

      <Modal open={createProjectOpen} title={dashboard.createProjectButton} onClose={() => setCreateProjectOpen(false)}>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-secondary">{dashboard.projectNameLabel}</label>
            <input
              value={projectCreateName}
              onChange={(event) => setProjectCreateName(event.target.value)}
              placeholder={dashboard.projectPlaceholder}
              className="input mt-2 w-full text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setCreateProjectOpen(false)}
              className="btn-secondary text-sm"
            >
              {dashboard.cancelButton}
            </button>
            <button
              onClick={createProject}
              disabled={actionLoading || !projectCreateName.trim()}
              className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? dashboard.saving : dashboard.saveButton}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={createTaskOpen} title={dashboard.createTaskButton} onClose={() => setCreateTaskOpen(false)}>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-secondary">{dashboard.taskTitleLabel}</label>
            <input
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder={dashboard.taskTitlePlaceholder}
              className="input mt-2 w-full text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-secondary">{dashboard.taskDescriptionLabel}</label>
            <textarea
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              rows={4}
              placeholder={dashboard.taskDescriptionPlaceholder}
              className="input mt-2 w-full text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setCreateTaskOpen(false)}
              className="btn-secondary text-sm"
            >
              {dashboard.cancelButton}
            </button>
            <button
              onClick={createTask}
              disabled={actionLoading || !taskTitle.trim()}
              className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? dashboard.saving : dashboard.saveButton}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        open={removeMemberConfirm.open}
        title="Remove Member"
        message={`Are you sure you want to remove ${removeMemberConfirm.userEmail} from this organization? They will lose access to all projects and tasks.`}
        confirmText="Remove Member"
        cancelText="Cancel"
        type="danger"
        onConfirm={removeMember}
        onCancel={() => setRemoveMemberConfirm({ open: false, userId: '', userEmail: '' })}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
