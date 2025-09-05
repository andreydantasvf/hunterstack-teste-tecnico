'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Header } from "@/components/layout/Header";
import { DeletePolicyDialog } from "@/components/policies/delete-policy-dialog";
import { PolicyCard } from "@/components/policies/policy-card";
import { PolicyDetails } from "@/components/policies/policy-details";
import { PolicyForm } from "@/components/policies/policy-form";
import { PolicyGridSkeleton } from "@/components/policies/policy-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePolicies } from '@/hooks/use-policies';
import { useDebounce } from '@/hooks/use-debounce';
import { type Policy, type PolicyFilters } from '@/lib/schemas';
import { Clock, FileText, TrendingUp, Search, Plus } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = parseInt(searchParams.get('page') || '1');
  const initialTerm = searchParams.get('term') || '';

  const [searchValue, setSearchValue] = useState(initialTerm);

  const [filters, setFilters] = useState<PolicyFilters>({
    page: initialPage,
    page_size: 9,
    term: initialTerm
  });

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    data: policiesResponse,
    isLoading,
    error
  } = usePolicies(filters);

  const updateFilters = useCallback((newFilters: Partial<PolicyFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    const params = new URLSearchParams();
    if (updatedFilters.term) params.set('term', updatedFilters.term);
    if (updatedFilters.page && updatedFilters.page > 1) params.set('page', updatedFilters.page.toString());

    const newUrl = params.toString() ? `?${params.toString()}` : '/';
    router.push(newUrl, { scroll: false });
  }, [filters, router]);

  useEffect(() => {
    if (debouncedSearchValue !== filters.term) {
      updateFilters({ term: debouncedSearchValue, page: 1 });
    }
  }, [debouncedSearchValue, filters.term, updateFilters]);

  const handleSearch = (term: string) => {
    setSearchValue(term);
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

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

  const renderPagination = () => {
    if (!policiesResponse || !('pagination' in policiesResponse) || !policiesResponse.pagination) {
      return null;
    }

    const { page, total_pages } = policiesResponse.pagination;

    if (total_pages <= 1) return null;

    // Calculate which pages to show
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(total_pages, page + 2);

    // Adjust if we're near the beginning or end
    if (page <= 3) {
      endPage = Math.min(5, total_pages);
    }
    if (page >= total_pages - 2) {
      startPage = Math.max(total_pages - 4, 1);
    }

    return (
      <div className="flex justify-center mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) handlePageChange(page - 1);
                }}
                className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {startPage > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(1);
                    }}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {startPage > 2 && <PaginationEllipsis />}
              </>
            )}

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNum);
                  }}
                  isActive={pageNum === page}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            {endPage < total_pages && (
              <>
                {endPage < total_pages - 1 && <PaginationEllipsis />}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(total_pages);
                    }}
                    className="cursor-pointer"
                  >
                    {total_pages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < total_pages) handlePageChange(page + 1);
                }}
                className={page >= total_pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  const totalPolicies = policiesResponse && 'pagination' in policiesResponse ?
    policiesResponse.pagination?.total :
    policiesResponse?.data?.length || 0;

  const policies = policiesResponse?.data || [];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-background">
        <Header
          onSearch={handleSearch}
          onAddPolicy={handleAddPolicy}
          searchValue={searchValue}
        />
        <main className="container mx-auto px-6 py-8">
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle className="text-destructive">Erro ao carregar políticas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </p>
              <Button onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header
        onSearch={handleSearch}
        onAddPolicy={handleAddPolicy}
        searchValue={searchValue}
      />

      <main className="container mx-auto px-4 sm:px-6 py-8 pb-20 md:pb-8">
        {/* Mobile Search Bar */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar políticas..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-background border-input focus:border-primary"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Políticas
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalPolicies}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Políticas Recentes
              </CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {policies.filter(p => {
                  const date = new Date(p.updatedAt || p.createdAt || '');
                  const now = new Date();
                  const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
                  return daysDiff <= 7;
                }).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categorias Únicas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {new Set(policies.map(p => p.category)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results Info */}
        {filters.term && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              {isLoading ? 'Buscando...' : `${totalPolicies} resultado(s) encontrado(s) para "${filters.term}"`}
            </p>
          </div>
        )}

        {/* Policies Grid */}
        {isLoading ? (
          <PolicyGridSkeleton />
        ) : policies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            {renderPagination()}
          </>
        ) : (
          <Card className="text-center p-6 sm:p-8">
            <CardHeader>
              <CardTitle>Nenhuma política encontrada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {filters.term
                  ? `Não foram encontradas políticas que correspondam ao termo "${filters.term}".`
                  : 'Ainda não há políticas cadastradas.'
                }
              </p>
              <Button onClick={handleAddPolicy} className="w-full sm:w-auto">
                <FileText className="h-4 w-4 mr-2" />
                Adicionar Primeira Política
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modals */}
      <PolicyForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        policy={selectedPolicy}
      />

      <PolicyDetails
        policy={selectedPolicy}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleEditPolicy}
        onDelete={handleDeletePolicy}
      />

      <DeletePolicyDialog
        policy={selectedPolicy}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      />

      {/* Floating Action Button for Mobile */}
      <Button
        onClick={handleAddPolicy}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary hover:bg-primary/90 shadow-glow shadow-lg z-50 transition-all duration-300 hover:scale-110 active:scale-95"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<PolicyGridSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
