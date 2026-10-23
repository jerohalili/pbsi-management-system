import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '@/lib/api.ts';

export function useQueryClientWrapper() {
  return useQueryClient();
}

export function useGet<T>(key: string[], url: string, options?: any) {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<T>(url);
      return data;
    },
    ...options,
  });
}

export function usePost<T, Body = any>(url: string, options?: any) {
  return useMutation<T, Error, Body>({
    mutationFn: async (body: Body) => {
      const { data } = await api.post<T>(url, body);
      return data;
    },
    ...options,
  });
}

export function usePut<T, Body = any>(url: string, options?: any) {
  return useMutation<T, Error, Body>({
    mutationFn: async (body: Body) => {
      const { data } = await api.put<T>(url, body);
      return data;
    },
    ...options,
  });
}

export function useDelete(url: string, options?: any) {
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await api.delete(`${url}/${id}`);
    },
    ...options,
  });
}

export function uploadFile(url: string, file: File, field = 'file') {
  const formData = new FormData();
  formData.append(field, file);
  return api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
