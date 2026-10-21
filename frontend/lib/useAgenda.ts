'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, Agendamento } from '@/lib/api';

async function fetchAgendaList(filtro: string, search: string, page: number) {
  const data = await api.getAgendamentos({
    filtro,
    search: search.trim() || undefined,
    page,
  });
  if (Array.isArray(data)) {
    return { results: data, count: data.length, totalPages: 1, pageSize: data.length };
  }
  return {
    results: data.results || [],
    count: data.count || 0,
    totalPages: data.total_pages || Math.ceil((data.count || 0) / (data.page_size || 20)),
    pageSize: data.page_size || 20,
  };
}

export function useAgenda() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [paginacao, setPaginacao] = useState({ count: 0, totalPages: 1, pageSize: 20, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusAtivo, setStatusAtivo] = useState('proximos');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPaginacao((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const recarregar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAgendaList(statusAtivo, debouncedSearch, paginacao.page);
      setAgendamentos(res.results);
      setPaginacao((prev) => ({ ...prev, count: res.count, totalPages: res.totalPages, pageSize: res.pageSize }));
    } finally {
      setLoading(false);
    }
  }, [statusAtivo, debouncedSearch, paginacao.page]);

  useEffect(() => {
    recarregar();
    const interval = setInterval(recarregar, 60000);
    return () => clearInterval(interval);
  }, [recarregar]);

  const setPage = (page: number) => setPaginacao((prev) => ({ ...prev, page }));

  return {
    agendamentos, loading, search, setSearch, statusAtivo, setStatusAtivo, recarregar, setPage,
    page: paginacao.page, totalCount: paginacao.count, totalPages: paginacao.totalPages, pageSize: paginacao.pageSize,
  };
}
