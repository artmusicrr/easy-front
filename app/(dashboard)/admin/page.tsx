'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { api } from '@/services/api'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ClipboardList, Shield, User, Clock, Download, Filter, RefreshCw } from 'lucide-react'

interface AuditLog {
  id: string
  acao: string
  detalhes: string
  timestamp: string
  user: {
    id: string
    nome: string
    email: string
    role: string
  }
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [periodDays, setPeriodDays] = useState('30')
  const [actionFilter, setActionFilter] = useState('')

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['audit-logs', page, periodDays, actionFilter],
    queryFn: async () => {
      console.log('Fetching audit logs - Page:', page, 'Period:', periodDays, 'Filter:', actionFilter);
      const response = await api.get('/audit-logs', {
        params: { 
          page, 
          limit: 10,
          days: parseInt(periodDays),
          acao: actionFilter || undefined
        }
      })
      console.log('Response pagination:', response.data.pagination);
      return response.data
    },
    staleTime: 0, // Sempre considerar dados como stale
    refetchOnMount: true,
  })

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Data/Hora',
      cell: ({ row }) => (
        <div className="flex items-center text-secondary-500 whitespace-nowrap text-xs">
           <Clock className="h-3.5 w-3.5 mr-2 opacity-60" />
           {new Date(row.original.timestamp).toLocaleString('pt-BR', {
             day: '2-digit',
             month: '2-digit',
             year: 'numeric',
             hour: '2-digit',
             minute: '2-digit'
           })}
        </div>
      ),
    },
    {
      accessorKey: 'user.nome',
      header: 'Usuário',
      cell: ({ row }) => (
        <div>
           <div className="font-semibold text-secondary-900 text-sm">{row.original.user?.nome || 'Sistema'}</div>
           <div className="text-xs text-secondary-400">{row.original.user?.email || 'N/A'}</div>
           <Badge variant={row.original.user?.role === 'admin' ? 'error' : 'default'} className="text-[10px] mt-1">
             {row.original.user?.role || 'sistema'}
           </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'acao',
      header: 'Ação',
      cell: ({ row }) => {
        const acao = row.original.acao;
        let variant: 'success' | 'error' | 'warning' | 'info' | 'default' = 'info';
        
        if (acao.includes('CREATED')) variant = 'success';
        else if (acao.includes('DELETED') || acao.includes('FAILED')) variant = 'error';
        else if (acao.includes('UPDATED')) variant = 'warning';
        
        return (
          <Badge variant={variant} className="text-[10px] tracking-wider py-1">
             {acao.replace(/_/g, ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'detalhes',
      header: 'Detalhes',
      cell: ({ row }) => {
        const detalhes = row.original.detalhes;
        if (!detalhes || detalhes === 'null') return <span className="text-secondary-400">-</span>;
        
        try {
          const parsed = JSON.parse(detalhes);
          const preview = JSON.stringify(parsed).substring(0, 100);
          return (
            <div className="max-w-[300px] truncate text-xs text-secondary-600 font-mono" title={JSON.stringify(parsed, null, 2)}>
               {preview}...
            </div>
          );
        } catch {
          return (
            <div className="max-w-[300px] truncate text-xs text-secondary-600">
               {detalhes}
            </div>
          );
        }
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-secondary-900">Logs de Auditoria</h1>
           </div>
           <p className="text-sm text-secondary-500">Histórico imutável de ações realizadas no sistema (Admin only).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3">
         <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
         <p className="text-xs text-amber-800 leading-relaxed font-medium">
            <strong>Nota de Segurança:</strong> Estes registros são imutáveis e servem para conformidade com normas de segurança de dados. Qualquer alteração ou acesso indevido é registrado automaticamente.
         </p>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Período
            </label>
            <select 
              className="w-full border border-secondary-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={periodDays}
              onChange={(e) => {
                setPeriodDays(e.target.value)
                setPage(1) // Reset to first page when filter changes
              }}
            >
              <option value="1">Hoje</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Tipo de Ação
            </label>
            <select 
              className="w-full border border-secondary-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setPage(1) // Reset to first page when filter changes
              }}
            >
              <option value="">Todas as ações</option>
              <option value="USER_">Usuários</option>
              <option value="PATIENT_">Pacientes</option>
              <option value="PAYMENT_">Pagamentos</option>
              <option value="TREATMENT_">Tratamentos</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="flex justify-center items-center h-64 bg-white border border-secondary-200 rounded-xl">
          <div className="text-secondary-400">Carregando registros de auditoria...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm">
            <strong>Erro ao carregar logs:</strong> {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-secondary-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-4 text-left font-semibold text-secondary-600"
                    >
                      {typeof column.header === 'string' ? column.header : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {(data?.logs || []).length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="h-24 text-center text-secondary-500">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  (data?.logs || []).map((log) => (
                    <tr key={log.id} className="hover:bg-secondary-50/50 transition-colors">
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 text-secondary-700">
                          {column.cell && typeof column.cell === 'function'
                            ? column.cell({ row: { original: log } } as any)
                            : null}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação Manual */}
          {data?.pagination && (
            <div className="flex items-center justify-between bg-white border border-secondary-200 rounded-xl p-4">
              <div className="text-sm text-secondary-500">
                Mostrando {data.logs.length} de {data.pagination.total} registros
                {` (Página ${page} de ${data.pagination.totalPages})`}
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 rounded-md border border-secondary-200 bg-white text-sm text-secondary-600 disabled:opacity-50 hover:bg-secondary-50 transition-colors"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                >
                  Anterior
                </button>
                <button
                  className="px-3 py-1 rounded-md border border-secondary-200 bg-white text-sm text-secondary-600 disabled:opacity-50 hover:bg-secondary-50 transition-colors"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= data.pagination.totalPages || isFetching}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
