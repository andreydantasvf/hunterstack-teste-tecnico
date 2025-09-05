export interface Policy {
  id: string;
  title: string;
  source_url: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyRequest {
  title: string;
  source_url: string;
  content: string;
  category: string;
}

export interface UpdatePolicyRequest {
  title?: string;
  source_url?: string;
  content?: string;
  category?: string;
}

export interface PolicyFilters {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface PolicyResponse {
  success: boolean;
  data: Policy[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SinglePolicyResponse {
  success: boolean;
  data: Policy;
}
