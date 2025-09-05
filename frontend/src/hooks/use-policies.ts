import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { policiesApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import {
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyFilters,
  Policy
} from '@/lib/schemas';
import { toast } from 'sonner';

export function usePolicies(filters: PolicyFilters = {}) {
  return useQuery({
    queryKey: queryKeys.policies.list(filters),
    queryFn: () => policiesApi.getPolicies(filters),
    staleTime: 1000 * 60 * 2 // 2 minutes
  });
}

export function usePolicy(id: string) {
  return useQuery({
    queryKey: queryKeys.policies.detail(id),
    queryFn: () => policiesApi.getPolicyById(id),
    enabled: !!id
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.policies.categories,
    queryFn: () => policiesApi.getCategories(),
    staleTime: 1000 * 60 * 10 // 10 minutes
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePolicyRequest) => policiesApi.createPolicy(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.policies.categories
      });

      toast.success('Política criada com sucesso!', {
        description: `A política "${data.data.title}" foi criada.`
      });
    },
    onError: (error) => {
      toast.error('Erro ao criar política', {
        description: error.message || 'Tente novamente mais tarde.'
      });
    }
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePolicyRequest }) =>
      policiesApi.updatePolicy(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.policies.detail(data.data.id!), data);

      queryClient.invalidateQueries({ queryKey: queryKeys.policies.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.policies.categories
      });

      toast.success('Política atualizada com sucesso!', {
        description: `A política "${data.data.title}" foi atualizada.`
      });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar política', {
        description: error.message || 'Tente novamente mais tarde.'
      });
    }
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => policiesApi.deletePolicy(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.policies.detail(deletedId)
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.policies.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.policies.categories
      });

      toast.success('Política deletada com sucesso!', {
        description: 'A política foi removida do sistema.'
      });
    },
    onError: (error) => {
      toast.error('Erro ao deletar política', {
        description: error.message || 'Tente novamente mais tarde.'
      });
    }
  });
}

export function useDownloadPolicy() {
  return useMutation({
    mutationFn: ({ id, format = 'json' }: { id: string; format?: 'json' }) =>
      policiesApi.downloadPolicy(id, format),
    onSuccess: (blob, { id }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `policy-${id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download iniciado!', {
        description: 'O arquivo da política está sendo baixado.'
      });
    },
    onError: (error) => {
      toast.error('Erro no download', {
        description: error.message || 'Não foi possível baixar a política.'
      });
    }
  });
}

export function useCopyPolicy() {
  return useMutation({
    mutationFn: async (policy: Policy) => {
      const text = JSON.stringify(policy, null, 2);
      await navigator.clipboard.writeText(text);
      return policy;
    },
    onSuccess: (policy) => {
      toast.success('Política copiada!', {
        description: `A política "${policy.title}" foi copiada para a área de transferência.`
      });
    },
    onError: () => {
      toast.error('Erro ao copiar', {
        description: 'Não foi possível copiar a política.'
      });
    }
  });
}
