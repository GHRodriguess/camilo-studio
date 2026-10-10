'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Phone,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { api, Cliente } from '@/lib/api';
import { SearchBar } from '@/components/molecules/SearchBar';
import { EmptyState } from '@/components/atoms/EmptyState';
import { NoSearchResultsState } from '@/components/atoms/NoSearchResultsState';
import { LoadingState } from '@/components/atoms/LoadingState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.getClientes()
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : data.results || [];
          setClientes(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Erro ao carregar clientes:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.telefone.includes(search) ||
        (c.tags && c.tags.toLowerCase().includes(search.toLowerCase()))
    );
  }, [clientes, search]);

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">
            Dossiê de Fidelidade
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">
            Gestão de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Histórico de visitas, preferências sensoriais e fórmulas químicas registradas.
          </p>
        </div>

        {/* ÚNICO BOTÃO PRIMÁRIO */}
        <Link
          href="/clientes/novo"
          className="inline-flex items-center justify-center rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 shrink-0 text-sm"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Nova Cliente
        </Link>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar cliente por nome, telefone ou tag (VIP, Loiros)..."
      />

      {loading ? (
        <LoadingState message="Carregando clientes cadastradas..." />
      ) : clientes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhuma cliente cadastrada"
          description="Inicie a base de clientes do Camilo Studio registrando a primeira cliente."
          actionLabel="Cadastrar Nova Cliente"
          onAction={() => router.push('/clientes/novo')}
        />
      ) : clientesFiltrados.length === 0 ? (
        <NoSearchResultsState searchTerm={search} onClear={() => setSearch('')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clientesFiltrados.map((cliente) => {
            const tags = cliente.tags ? cliente.tags.split(',').map((t) => t.trim()) : [];
            const isVip = tags.some((t) => t.toUpperCase() === 'VIP');

            return (
              <Link
                key={cliente.id}
                href={`/clientes/${cliente.id}`}
                className="group p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between block cursor-pointer"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <Avatar className="w-12 h-12 border border-outline-variant shrink-0">
                      <AvatarImage src={cliente.foto_url} alt={cliente.nome} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {cliente.nome.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-semibold text-on-surface font-heading truncate group-hover:text-primary transition-colors">
                          {cliente.nome}
                        </h3>
                        {isVip && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] px-2 py-0 rounded-full font-semibold">
                            VIP
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant font-mono mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-primary/70" />
                        {cliente.telefone}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0 mt-1" />
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full text-[10px] bg-surface-container text-on-surface-variant font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Resumo Sensorial / Cuidados */}
                  {cliente.preferencias_sensoriais && (
                    <p className="text-[11px] text-on-surface-variant/80 italic line-clamp-1 bg-surface-container-low/70 p-2 rounded-xl mb-3">
                      ☕ {cliente.preferencias_sensoriais}
                    </p>
                  )}
                </div>

                {/* Métricas da Cliente */}
                <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{cliente.visitas_realizadas} visitas</span>
                  </div>
                  <div className="font-heading font-semibold text-on-surface">
                    R$ {Number(cliente.total_investido).toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
