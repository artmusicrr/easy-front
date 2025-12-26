'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { treatmentService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Search, ArrowRight, DollarSign, User, Stethoscope, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/utils/utils'

export default function SelectTreatmentForPaymentPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['treatments-for-payment', page, search],
    queryFn: () => treatmentService.getAll({ 
        page, 
        limit: 10, 
        status: 'aberto', // Foca em tratamentos em aberto
        search: search || undefined 
    }),
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Registrar Pagamento</h1>
          <p className="text-sm text-secondary-500">Selecione o tratamento para o qual deseja registrar o pagamento.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-secondary-200 shadow-soft flex items-center">
        <Search className="h-5 w-5 text-secondary-400 mr-3" />
        <input 
          type="text" 
          placeholder="Buscar por paciente ou descrição do tratamento..." 
          className="flex-1 bg-transparent outline-none text-secondary-900 placeholder:text-secondary-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-secondary-500">Carregando tratamentos...</p>
          </div>
        ) : data?.treatments?.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="bg-secondary-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Stethoscope className="h-8 w-8 text-secondary-300" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900">Nenhum tratamento encontrado</h3>
            <p className="text-secondary-500">Não encontramos tratamentos em aberto com estes critérios.</p>
          </Card>
        ) : (
          data?.treatments?.map((t: any) => (
            <Link key={t.id} href={`/payments/new/${t.id}`}>
              <Card className="hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-secondary-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                      <User className="h-6 w-6 text-secondary-400 group-hover:text-primary-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary-900">{t.patient.nome}</h4>
                      <p className="text-sm text-secondary-500 flex items-center">
                        <Stethoscope className="h-3.5 w-3.5 mr-1" />
                        {t.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Saldo Devedor</p>
                      <p className="text-lg font-black text-primary-600">{formatCurrency(t.valor_total - t.valor_pago_total)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-secondary-200 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 transition-all">
                      <ArrowRight className="h-5 w-5 text-secondary-400 group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
