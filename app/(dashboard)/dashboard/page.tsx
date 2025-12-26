'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Users,
  Stethoscope,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { formatCurrency } from '@/utils/utils'
import { dashboardService } from '@/services'

// Dados estáticos para design inicial (serão substituídos por chamadas de API)
const INITIAL_STATS = [
  { id: 'activePatients', label: 'Pacientes Ativos', value: '...', icon: Users, trend: 'Atualizado', color: 'text-primary-600', bg: 'bg-primary-50' },
  { id: 'openTreatments', label: 'Tratamentos Abertos', value: '...', icon: Stethoscope, trend: 'Atualizado', color: 'text-accent-600', bg: 'bg-accent-50' },
  { id: 'monthlyRevenue', label: 'Receita Mensal', value: '...', icon: TrendingUp, trend: 'Mês atual', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'riskIndex', label: 'Índice de Risco', value: '12%', icon: AlertCircle, trend: '-2%', color: 'text-amber-600', bg: 'bg-amber-50' },
]

const CHART_DATA = [
  { name: 'Jan', receita: 32000, atendimentos: 80 },
  { name: 'Fev', receita: 38000, atendimentos: 95 },
  { name: 'Mar', receita: 45000, atendimentos: 110 },
  { name: 'Abr', receita: 42400, atendimentos: 105 },
]

const RECENT_TREATMENTS = [
  { id: '1', patient: 'Maria Oliveira', treatment: 'Canal', status: 'aberto', risk: 'baixo', value: 1500 },
  { id: '2', patient: 'João Silva', treatment: 'Limpeza', status: 'pago', risk: 'baixo', value: 200 },
  { id: '3', patient: 'Carlos Santos', treatment: 'Implante', status: 'atrasado', risk: 'critico', value: 5000 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState(INITIAL_STATS)
  const [chartData, setChartData] = useState<any[]>([])
  const [recentTreatments, setRecentTreatments] = useState<any[]>([])
  const [overdueData, setOverdueData] = useState<any>(null)
  const [overdueByMonth, setOverdueByMonth] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      console.log('[Dashboard] Buscando estatísticas...')
      const data = await dashboardService.getStats()
      console.log('[Dashboard] Dados recebidos:', data)
      
      if (!data) throw new Error('Dados não recebidos')

      setStats(prev => prev.map(stat => {
        const valExists = data[stat.id] !== undefined;
        if (stat.id === 'activePatients') return { ...stat, value: (data.activePatients ?? 0).toString() }
        if (stat.id === 'openTreatments') return { ...stat, value: (data.openTreatments ?? 0).toString() }
        if (stat.id === 'monthlyRevenue') return { ...stat, value: formatCurrency(data.monthlyRevenue ?? 0) }
        if (stat.id === 'riskIndex') {
           const risk = data.riskIndex ?? 0;
           return { ...stat, value: `${Math.round(risk)}%`, trend: risk > 50 ? 'Atenção' : 'Estável' }
        }
        return stat
      }))

      console.log('[Dashboard] ChartData:', data.chartData)
      console.log('[Dashboard] RecentTreatments:', data.recentTreatments)
      
      setChartData(data.chartData || [])
      setRecentTreatments(data.recentTreatments || [])
      setOverdueData(data.overdue || { total: 0, value: 0, calote: 0 })
      setOverdueByMonth(data.overdueByMonth || [])
    } catch (error) {
      console.error('[Dashboard] Erro ao carregar estatísticas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard Geral</h1>
        <p className="text-sm text-secondary-500">Bem-vindo ao painel administrativo do EasyCore.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none transition-transform hover:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <div className={cn('rounded-xl p-3', stat.bg)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">{stat.label}</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold text-secondary-900">{stat.value}</h3>
                  <span className={cn(
                    "text-xs font-semibold",
                    stat.id === 'riskIndex' && parseInt(stat.value) > 50 ? "text-red-500" : "text-green-600"
                  )}>{stat.trend}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Inadimplência Section */}
      {overdueData && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-none transition-transform hover:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <div className="rounded-xl bg-red-50 p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Parcelas Atrasadas</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold text-secondary-900">{overdueData.total}</h3>
                  <span className="text-xs font-semibold text-red-600">{overdueData.calote} calote</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none transition-transform hover:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <div className="rounded-xl bg-orange-50 p-3">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Valor em Atraso</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold text-secondary-900">{formatCurrency(overdueData.value)}</h3>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none transition-transform hover:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <div className="rounded-xl bg-blue-50 p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">Taxa de Inadimplência</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold text-secondary-900">
                    {overdueData.total > 0 ? ((overdueData.total / (overdueData.total + 157)) * 100).toFixed(1) : 0}%
                  </h3>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Evolução de Receita" description="Acompanhamento mensal da receita bruta da clínica">
          <div className="h-[240px] w-full pt-4">
            {!isLoading ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `R$${val / 1000}k`} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="receita" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full w-full bg-secondary-50 animate-pulse rounded-lg flex items-center justify-center text-secondary-300">Carregando dados...</div>
            )}
          </div>
        </Card>

        <Card title="Atendimentos Mensais" description="Volume de atendimentos realizados por mês">
          <div className="h-[240px] w-full pt-4">
            {!isLoading ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="atendimentos" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full w-full bg-secondary-50 animate-pulse rounded-lg flex items-center justify-center text-secondary-300">Carregando dados...</div>
            )}
          </div>
        </Card>

        <Card title="Inadimplência Mensal" description="Evolução de parcelas atrasadas nos últimos 5 meses">
          <div className="h-[240px] w-full pt-4">
            {!isLoading ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overdueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#fef2f2' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number | undefined, name: string) => {
                      if (name === 'quantidade') return [value || 0, 'Parcelas Atrasadas']
                      if (name === 'valor') return [formatCurrency(value || 0), 'Valor Atrasado']
                      return [value, name]
                    }}
                  />
                  <Bar dataKey="quantidade" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} name="Parcelas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-secondary-50 animate-pulse rounded-lg flex items-center justify-center text-secondary-300">Carregando dados...</div>
            )}
          </div>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Treatments Table */}
        <Card className="lg:col-span-2" title="Tratamentos Recentes" description="Últimos tratamentos iniciados no sistema">
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-secondary-100 font-medium text-secondary-500">
                  <th className="pb-3 text-left pl-0">Paciente</th>
                  <th className="pb-3 text-left">Tratamento</th>
                  <th className="pb-3 text-left text-center">Risco</th>
                  <th className="pb-3 text-left">Valor</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {!isLoading ? (
                  (recentTreatments || []).map((item) => (
                    <tr key={item.id} className="hover:bg-secondary-50/50 transition-colors">
                      <td className="py-4 pl-0 font-medium text-secondary-900">{item.patient}</td>
                      <td className="py-4 text-secondary-600 truncate max-w-[150px]">{item.treatment}</td>
                      <td className="py-4 text-center">
                        <Badge variant={item.risk === 'critico' ? 'error' : item.risk === 'medio' ? 'warning' : 'success'}>
                          {item.risk}
                        </Badge>
                      </td>
                      <td className="py-4 font-mono text-secondary-700">{formatCurrency(item.value)}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5 font-medium">
                          {item.status === 'pago' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : item.status === 'atrasado' ? <AlertCircle className="h-4 w-4 text-red-600" /> : <Clock className="h-4 w-4 text-primary-600" />}
                          <span className={cn(item.status === 'pago' ? 'text-green-700' : item.status === 'atrasado' ? 'text-red-700' : 'text-primary-700')}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                    <tr>
                        <td colSpan={5} className="py-8 text-center text-secondary-400">Carregando tratamentos...</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Action Quick Links / Alerts */}
        <div className="space-y-6">
          <Card title="Alertas de Sistema" className="border-l-4 border-l-red-500">
            <div className="space-y-4">
              {overdueData && overdueData.total > 0 && (
                <div className="flex items-start space-x-3 rounded-lg bg-red-50 p-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Inadimplência Crítica</p>
                    <p className="text-xs text-red-700">
                      {overdueData.total} parcelas em atraso ({overdueData.calote} em calote) - {formatCurrency(overdueData.value)}
                    </p>
                  </div>
                </div>
              )}
              {(!overdueData || overdueData.total === 0) && (
                <div className="flex items-start space-x-3 rounded-lg bg-green-50 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Pagamentos em Dia</p>
                    <p className="text-xs text-green-700">Todas as parcelas estão em dia!</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Ações Rápidas">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/patients/new" className="flex flex-col items-center justify-center rounded-xl bg-primary-600 p-4 text-white shadow-sm transition-all hover:bg-primary-700">
                <Users className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">Novo Paciente</span>
              </Link>
              <Link href="/payments/new" className="flex flex-col items-center justify-center rounded-xl bg-accent-600 p-4 text-white shadow-sm transition-all hover:bg-accent-700">
                <DollarSign className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">Registrar Pagto</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
