import {
  Policy,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyFilters,
  PolicyResponse,
  SinglePolicyResponse
} from '@/types/policy';

// Mock data for demonstration
const mockPolicies: Policy[] = [
  {
    id: '1',
    title: 'Política de Privacidade - Google',
    source_url: 'https://policies.google.com/privacy',
    content:
      'Esta Política de Privacidade descreve como coletamos, usamos e compartilhamos informações quando você usa nossos serviços...',
    category: 'Tech Giant',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Política de Privacidade - Facebook/Meta',
    source_url: 'https://www.facebook.com/privacy/policy',
    content:
      'Na Meta, protegemos a privacidade dos nossos usuários e oferecemos ferramentas para que você controle suas informações...',
    category: 'Tech Giant',
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: '3',
    title: 'Política de Privacidade - Amazon',
    source_url:
      'https://www.amazon.com/gp/help/customer/display.html?nodeId=468496',
    content:
      'A Amazon valoriza a privacidade dos nossos clientes. Esta política descreve como coletamos e utilizamos informações pessoais...',
    category: 'E-commerce',
    createdAt: '2024-01-12T08:45:00Z',
    updatedAt: '2024-01-18T14:30:00Z'
  },
  {
    id: '4',
    title: 'Política de Privacidade - Spotify',
    source_url: 'https://www.spotify.com/us/privacy',
    content:
      'No Spotify, respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais...',
    category: 'Entertainment',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-16T11:20:00Z'
  },
  {
    id: '5',
    title: 'Política de Privacidade - Netflix',
    source_url: 'https://help.netflix.com/legal/privacy',
    content:
      'A Netflix coleta, usa e divulga informações sobre você de acordo com esta Política de Privacidade...',
    category: 'Entertainment',
    createdAt: '2024-01-08T16:15:00Z',
    updatedAt: '2024-01-22T10:45:00Z'
  },
  {
    id: '6',
    title: 'Política de Privacidade - Microsoft',
    source_url: 'https://privacy.microsoft.com/en-us/privacystatement',
    content:
      'A Microsoft está comprometida em proteger sua privacidade. Esta declaração de privacidade explica os dados pessoais que a Microsoft processa...',
    category: 'Tech Giant',
    createdAt: '2024-01-05T13:30:00Z',
    updatedAt: '2024-01-19T16:00:00Z'
  }
];

const categories = [
  'Tech Giant',
  'E-commerce',
  'Entertainment',
  'Financial',
  'Healthcare',
  'Social Media'
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const policiesApi = {
  // List/Search policies with filters and pagination
  async getPolicies(filters: PolicyFilters = {}): Promise<PolicyResponse> {
    await delay(800); // Simulate network delay

    let filteredPolicies = [...mockPolicies];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPolicies = filteredPolicies.filter(
        (policy) =>
          policy.title.toLowerCase().includes(searchTerm) ||
          policy.content.toLowerCase().includes(searchTerm) ||
          policy.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filteredPolicies = filteredPolicies.filter(
        (policy) => policy.category === filters.category
      );
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPolicies = filteredPolicies.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedPolicies,
      pagination: {
        page,
        limit,
        total: filteredPolicies.length,
        totalPages: Math.ceil(filteredPolicies.length / limit)
      }
    };
  },

  // Get single policy by ID
  async getPolicyById(id: string): Promise<SinglePolicyResponse> {
    await delay(500);

    const policy = mockPolicies.find((p) => p.id === id);
    if (!policy) {
      throw new Error('Policy not found');
    }

    return {
      success: true,
      data: policy
    };
  },

  // Create new policy
  async createPolicy(data: CreatePolicyRequest): Promise<SinglePolicyResponse> {
    await delay(1000);

    const newPolicy: Policy = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockPolicies.unshift(newPolicy);

    return {
      success: true,
      data: newPolicy
    };
  },

  // Update existing policy
  async updatePolicy(
    id: string,
    data: UpdatePolicyRequest
  ): Promise<SinglePolicyResponse> {
    await delay(800);

    const policyIndex = mockPolicies.findIndex((p) => p.id === id);
    if (policyIndex === -1) {
      throw new Error('Policy not found');
    }

    const updatedPolicy: Policy = {
      ...mockPolicies[policyIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    mockPolicies[policyIndex] = updatedPolicy;

    return {
      success: true,
      data: updatedPolicy
    };
  },

  // Delete policy
  async deletePolicy(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    await delay(600);

    const policyIndex = mockPolicies.findIndex((p) => p.id === id);
    if (policyIndex === -1) {
      throw new Error('Policy not found');
    }

    mockPolicies.splice(policyIndex, 1);

    return {
      success: true,
      message: 'Policy deleted successfully'
    };
  },

  // Get available categories
  async getCategories(): Promise<string[]> {
    await delay(300);
    return categories;
  }
};
