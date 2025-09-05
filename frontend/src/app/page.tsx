'use client';
import { Header } from "@/components/layout/Header";
import { DeletePolicyDialog } from "@/components/policies/delete-policy-dialog";
import { PolicyCard } from "@/components/policies/policy-card";
import { PolicyDetails } from "@/components/policies/policy-details";
import { PolicyFilters } from "@/components/policies/policy-filters";
import { PolicyForm } from "@/components/policies/policy-form";
import { PolicyGridSkeleton } from "@/components/policies/policy-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { policiesApi } from "@/lib/api";
import { Policy, PolicyFilters as FilterType, CreatePolicyRequest } from '@/types/policy';
import { ChevronLeft, ChevronRight, Clock, FileText, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterType>({ page: 1, limit: 9 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load policies
  const loadPolicies = async (newFilters?: FilterType) => {
    try {
      setIsLoading(true);
      const currentFilters = newFilters || filters;
      const response = await policiesApi.getPolicies(currentFilters);
      setPolicies(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    loadPolicies(newFilters);
  };

  // Handle search
  const handleSearch = (search: string) => {
    const newFilters = { ...filters, search, page: 1 };
    handleFiltersChange(newFilters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    handleFiltersChange(newFilters);
  };

  // Handle policy actions
  const handleAddPolicy = () => {
    setSelectedPolicy(null);
    setIsFormOpen(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsFormOpen(true);
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsDetailsOpen(true);
  };

  const handleDeletePolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsDeleteOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = async (data: CreatePolicyRequest) => {
    try {
      setIsSubmitting(true);

      if (selectedPolicy) {
        await policiesApi.updatePolicy(selectedPolicy.id, data);

      } else {
        await policiesApi.createPolicy(data);

      }

      loadPolicies();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);

    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async (policy: Policy) => {
    try {
      setIsSubmitting(true);
      await policiesApi.deletePolicy(policy.id);

      loadPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);

    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    {
      title: "Total de Políticas",
      value: pagination.total,
      icon: FileText,
      color: "text-primary"
    },
    {
      title: "Categorias",
      value: new Set(policies.map(p => p.category)).size,
      icon: TrendingUp,
      color: "text-accent"
    },
    {
      title: "Atualizadas Hoje",
      value: policies.filter(p => {
        const today = new Date();
        const updated = new Date(p.updatedAt);
        return today.toDateString() === updated.toDateString();
      }).length,
      icon: Clock,
      color: "text-warning"
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header
        onSearch={handleSearch}
        onAddPolicy={handleAddPolicy}
        searchValue={filters.search || ''}
      />

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          {/* Filters Sidebar */}
          <div>
            <PolicyFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              totalResults={pagination.total}
            />
          </div>

          {/* Main Content */}
          <div className="mt-8 space-y-6">
            {/* Policies Grid */}
            {isLoading ? (
              <PolicyGridSkeleton />
            ) : policies.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma política encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  {filters.search || filters.category
                    ? 'Tente ajustar seus filtros de busca.'
                    : 'Comece criando sua primeira política.'}
                </p>
                <Button onClick={handleAddPolicy} className="bg-gradient-primary hover:bg-primary-hover">
                  Criar Nova Política
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {policies.map((policy) => (
                    <PolicyCard
                      key={policy.id}
                      policy={policy}
                      onView={handleViewPolicy}
                      onEdit={handleEditPolicy}
                      onDelete={handleDeletePolicy}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={page === pagination.page ? "bg-gradient-primary" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <PolicyForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        policy={selectedPolicy}
        isLoading={isSubmitting}
      />

      <PolicyDetails
        policy={selectedPolicy}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleEditPolicy}
      />

      <DeletePolicyDialog
        policy={selectedPolicy}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
      />
    </div>
  );
}
