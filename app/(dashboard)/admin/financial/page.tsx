'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { financialService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RiskIndicator } from '@/components/ui/RiskIndicator'
import { TrendingDown, Users, AlertCircle, ArrowRight, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/utils/utils'

export default function AdminFinancialPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-financial-overview'],
    queryFn: () => financialService.getAdminOverview(),
  })

  if (isLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-10 w-64 bg-secondary-200 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-secondary-200 rounded-xl"></div>
        <div className="h-32 bg-secondary-200 rounded-xl"></div>
        <div className="h-32 bg-secondary-200 rounded-xl"></div>
      </div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Gestão Financeira</h1>
        <p className="text-sm text-secondary-500">Visão consolidada de inadimplência e riscos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50 border-red-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-600 uppercase">Total em Atraso</p>
              <h2 className="text-2xl font-black text-secondary-900">{formatCurrency(data?.total_em_atraso || 0)}</h2>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-secondary-500 uppercase">Parcelas Vencidas</p>
              <h2 className="text-2xl font-black text-secondary-900">{data?.pacientes_risco?.length || 0}</h2>
            </div>
          </div>
        </Card>

        <Card className="bg-secondary-900 text-white border-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-secondary-400 uppercase">Ações Rápidas</p>
              <Link href="/admin/financial/overdue">
                <Button variant="link" className="text-white p-0 h-auto font-bold mt-1">
                  Ver todas as parcelas 
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <Users className="h-8 w-8 text-secondary-700" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ranking de Risco por Paciente" description="Pacientes com maior probabilidade de calote">
          <div className="space-y-4">
            {data?.pacientes_risco?.map((p: any) => (
              <div key={p.treatment_id} className="flex items-center justify-between p-4 rounded-xl border border-secondary-100 bg-white hover:bg-secondary-50 transition-colors">
                <div className="flex-1 mr-4">
                  <p className="text-sm font-bold text-secondary-900">{p.paciente}</p>
                  <p className="text-xs text-secondary-500">Dívida: {formatCurrency(p.divida)}</p>
                </div>
                <div className="w-32">
                  <RiskIndicator score={p.risco} level={p.risco > 75 ? 'critico' : p.risco > 50 ? 'alto' : 'medio'} />
                </div>
                <Link href={`/treatments/${p.treatment_id}`}>
                  <Button size="sm" variant="ghost" className="ml-2">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
            {(!data?.pacientes_risco || data.pacientes_risco.length === 0) && (
              <div className="text-center py-8 text-secondary-400 italic">
                Nenhum paciente em risco detectado.
              </div>
            )}
          </div>
        </Card>

        <Card title="Histórico de Inadimplência" description="Evolução de pagamentos valor 0">
           <div className="h-[300px] flex items-center justify-center text-secondary-400">
              <div className="text-center">
                <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">Gráfico de Evolução Mensal</p>
                <p className="text-[10px] mt-1 uppercase tracking-widest font-bold text-secondary-500">Em Breve (Recharts)</p>
              </div>
           </div>
        </Card>
      </div>
    </div>
  )
}
