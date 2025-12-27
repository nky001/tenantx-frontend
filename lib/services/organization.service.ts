import api from '../api';

export interface Organization {
  id: string;
  name: string;
  createdAt?: string;
}

export interface CreateOrganizationRequest {
  name: string;
}

export interface UpdateOrganizationRequest {
  name: string;
}

export interface SwitchOrganizationRequest {
  organizationId: string;
}

export interface SwitchOrganizationResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface Member {
  userId: string;
  email: string;
  role: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: string;
  invitedAt: string;
}

export interface InviteMemberRequest {
  email: string;
  role: string;
}

export interface ChangeMemberRoleRequest {
  role: string;
}

export const organizationService = {
  getAll: async (): Promise<Organization[]> => {
    const response = await api.get<Organization[]>('/organizations');
    return response.data;
  },

  create: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await api.post<Organization>('/organizations', data);
    return response.data;
  },

  update: async (orgId: string, data: UpdateOrganizationRequest): Promise<Organization> => {
    const response = await api.put<Organization>(`/organizations/${orgId}`, data);
    return response.data;
  },

  delete: async (orgId: string): Promise<void> => {
    await api.delete(`/organizations/${orgId}`);
  },

  switch: async (data: SwitchOrganizationRequest): Promise<SwitchOrganizationResponse> => {
    const response = await api.post<SwitchOrganizationResponse>('/organizations/switch', data);
    return response.data;
  },

  getMembers: async (orgId: string): Promise<Member[]> => {
    const response = await api.get<Member[]>(`/organizations/${orgId}/members`);
    return response.data;
  },

  inviteMember: async (orgId: string, data: InviteMemberRequest): Promise<void> => {
    await api.post(`/organizations/${orgId}/invite`, data);
  },

  changeMemberRole: async (orgId: string, userId: string, data: ChangeMemberRoleRequest): Promise<void> => {
    await api.put(`/organizations/${orgId}/members/${userId}/role`, data);
  },

  removeMember: async (orgId: string, userId: string): Promise<void> => {
    await api.delete(`/organizations/${orgId}/members/${userId}`);
  },

  getPendingInvites: async (orgId: string): Promise<PendingInvite[]> => {
    const response = await api.get<PendingInvite[]>(`/organizations/${orgId}/pending-invites`);
    return response.data;
  },

  revokeInvite: async (orgId: string, inviteId: string): Promise<void> => {
    await api.delete(`/organizations/${orgId}/pending-invites/${inviteId}`);
  },

  acceptInvite: async (token: string): Promise<Organization> => {
    const response = await api.post<Organization>(`/organizations/accept-invite?token=${token}`);
    return response.data;
  },
};
