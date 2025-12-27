import api from '../api';

export interface Project {
  id: string;
  name: string;
  organizationId: string;
  createdAt?: string;
}

export interface CreateProjectRequest {
  name: string;
}

export const projectService = {
  getAll: async (organizationId?: string): Promise<Project[]> => {
    const query = organizationId ? `?organizationId=${organizationId}` : '';
    const response = await api.get<Project[]>(`/projects${query}`);
    return response.data;
  },

  create: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  update: async (projectId: string, data: CreateProjectRequest): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${projectId}`, data);
    return response.data;
  },

  delete: async (projectId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}`);
  },
};
