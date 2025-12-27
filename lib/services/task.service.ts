import api from '../api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  projectId: string;
  createdAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string;
}

export const taskService = {
  getByProject: async (projectId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/tasks?projectId=${projectId}`);
    return response.data;
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  update: async (taskId: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${taskId}`, data);
    return response.data;
  },

  updateStatus: async (taskId: string, status: string): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  complete: async (taskId: string): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${taskId}/complete`);
    return response.data;
  },

  discontinue: async (taskId: string): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${taskId}/discontinue`);
    return response.data;
  },

  delete: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },
};
