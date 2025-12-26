'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { financialService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Calendar, User, DollarSign, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/utils/utils'

export default function OverdueInstallmentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['overdue-installments'],
    queryFn: () => financialService.getOverdueInstallments(),
  })

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'payment_plan.treatment.patient.nome',
      header: 'Paciente',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center mr-3">
            <User className="h-4 w-4 text-secondary-600" />
          </div>
          <span className="font-semibold text-secondary-900">{row.original.payment_plan.treatment.patient.nome}</span>
        </div>
      ),
    },
    {
      accessorKey: 'numero_parcela',
      header: 'Parcela',
      cell: ({ row }) => (
        <span className="text-secondary-600">#{row.original.numero_parcela}</span>
      ),
    },
    {
      accessorKey: 'valor_esperado',
      header: 'Valor',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-red-600">{formatCurrency(row.original.valor_esperado)}</span>
      ),
    },
    {
      accessorKey: 'data_vencimento',
      header: 'Vencimento',
      cell: ({ row }) => (
        <div className="flex items-center text-secondary-500">
          <Calendar className="h-3.5 w-3.5 mr-2 opacity-70" />
          {formatDate(row.original.data_vencimento)}
        </div>
      ),
    },
    {
      accessorKey: 'is_calote',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_calote ? 'error' : 'warning'}>
          {row.original.is_calote ? 'Calote Registrado (>60d)' : 'Em Atraso'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link href={`/treatments/${row.original.payment_plan.treatment_id}`}>
          <Button variant="ghost" size="sm">
            Ver Tratamento
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/financial">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Parcelas em Atraso</h1>
          <p className="text-sm text-secondary-500">Listagem completa de inadimplência pendente.</p>
        </div>
      </div>

      <Card>
        <DataTable 
          columns={columns} 
          data={data || []} 
          isLoading={isLoading}
        />
      </Card>
      
      <div className="flex items-center space-x-2 p-4 rounded-xl border border-secondary-200 bg-secondary-50 italic text-xs text-secondary-500">
        <AlertCircle className="h-4 w-4 text-secondary-400" />
        Nota: Estas parcelas são atualizadas automaticamente com base na data do servidor.
      </div>
    </div>
  )
}
