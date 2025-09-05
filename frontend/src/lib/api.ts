import {
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyFilters,
  PoliciesListResponse,
  PoliciesSearchResponse,
  PolicyResponse,
  DeletePolicyResponse,
  policiesListResponseSchema,
  policiesSearchResponseSchema,
  policyResponseSchema,
  deletePolicyResponseSchema
} from '@/lib/schemas';

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export const policiesApi = {
  async getPolicies(
    filters: PolicyFilters = {}
  ): Promise<PoliciesListResponse | PoliciesSearchResponse> {
    const params = new URLSearchParams();

    if (filters.term) params.append('term', filters.term);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size)
      params.append('page_size', filters.page_size.toString());

    const queryString = params.toString();
    const endpoint = `/policies${queryString ? `?${queryString}` : ''}`;

    const response = await apiCall<
      PoliciesListResponse | PoliciesSearchResponse
    >(endpoint, { headers: { 'Content-Type': 'application/json' } });

    if ('pagination' in response) {
      return policiesSearchResponseSchema.parse(response);
    } else {
      return policiesListResponseSchema.parse(response);
    }
  },

  async getPolicyById(id: string): Promise<PolicyResponse> {
    const response = await apiCall<PolicyResponse>(`/policies/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    return policyResponseSchema.parse(response);
  },

  async createPolicy(data: CreatePolicyRequest): Promise<PolicyResponse> {
    const response = await apiCall<PolicyResponse>('/policies', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    return policyResponseSchema.parse(response);
  },

  async updatePolicy(
    id: string,
    data: UpdatePolicyRequest
  ): Promise<PolicyResponse> {
    const response = await apiCall<PolicyResponse>(`/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    return policyResponseSchema.parse(response);
  },

  async deletePolicy(id: string): Promise<DeletePolicyResponse> {
    const response = await apiCall<DeletePolicyResponse>(`/policies/${id}`, {
      method: 'DELETE'
    });
    return deletePolicyResponseSchema.parse(response);
  },

  async downloadPolicy(id: string, format: 'json' = 'json'): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/policies/${id}/download?format=${format}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  },

  async getCategories(): Promise<string[]> {
    const response = await this.getPolicies();
    const categories = new Set(response.data.map((policy) => policy.category));
    return Array.from(categories).sort();
  }
};
