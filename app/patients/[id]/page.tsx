'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { patientService, treatmentService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Stethoscope,
  Plus,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency, maskCPF } from '@/utils/utils'

interface PatientDetails {
  id: string
  nome: string
  telefone: string
  email: string
  data_cadastro: string
  cpf_encrypted: string
  consentimento_lgpd: boolean
  valor_total: number
  valor_pago: number
  status: string
  risco_inadimplencia: number
  descricao_ultimo_tratamento: string
  dentista: string
}

export default function PatientDetailsPage() {
  const { id } = useParams() as { id: string }

  const { data: patient, isLoading: isLoadingPatient, isError: isErrorPatient, error: patientError } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await patientService.getById(id)
      return response.patient as PatientDetails
    },
  })

  const { data: treatmentsData, isLoading: isLoadingTreatments } = useQuery({
    queryKey: ['patient-treatments', id],
    queryFn: () => treatmentService.getAll({ patient_id: id }),
    enabled: !!id,
  })

  if (isLoadingPatient) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-secondary-200 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-secondary-200 rounded-xl"></div>
        <div className="h-64 bg-secondary-200 rounded-xl col-span-2"></div>
      </div>
    </div>
  }

  if (isErrorPatient || !patient) {
    const errorMessage = patientError ? (patientError as any).message : 'Paciente não encontrado';
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-secondary-100 shadow-soft max-w-lg mx-auto mt-10">
        <User className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-secondary-900 mb-2">Erro ao carregar paciente</h2>
        <p className="text-secondary-500 mb-2">ID solicitado: <code className="bg-secondary-50 px-2 py-0.5 rounded text-xs">{id}</code></p>
        <p className="text-secondary-500 mb-6">{errorMessage}</p>

        <div className="flex justify-center gap-4">
          <Link href="/patients">
            <Button variant="outline">Voltar para listagem</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/patients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{patient.nome}</h1>
            <p className="text-sm text-secondary-500">Desde {formatDate(patient.data_cadastro)}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link href={`/patients/${id}/edit`}>
            <Button variant="outline">Editar Cadastro</Button>
          </Link>
          <Link href={`/treatments/new?patient_id=${id}`}>
            <Button className="bg-accent-600 hover:bg-accent-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Tratamento
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Profile Card */}
        <div className="space-y-6">
          <Card className="text-center py-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold mb-4">
              {patient.nome.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-secondary-900">{patient.nome}</h3>
            <p className="text-sm text-secondary-500 mb-2">{patient.email || 'Sem email cadastrado'}</p>

            {/* Status Badge */}
            <div className="mb-6">
              <Badge variant={
                patient.status === 'inadimplente' ? 'error' :
                  patient.status === 'quitado' ? 'success' :
                    patient.status === 'novo' ? 'info' : 'primary'
              }>
                {patient.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-4 text-left border-t border-secondary-50 pt-6 px-2">
              <div className="flex items-center text-sm justify-between">
                <span className="text-secondary-500 flex items-center"><Phone className="h-4 w-4 mr-2" /> Telefone</span>
                <span className="text-secondary-900 font-medium">{patient.telefone || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm justify-between">
                <span className="text-secondary-500 flex items-center"><ShieldCheck className="h-4 w-4 mr-2" /> CPF</span>
                <span className="text-secondary-900 font-medium">{maskCPF(patient.cpf_encrypted || '')}</span>
              </div>

              <div className="py-2 border-t border-dashed border-secondary-100 my-2"></div>

              <div className="flex items-center text-sm justify-between">
                <span className="text-secondary-500">Valor Total</span>
                <span className="text-secondary-900 font-bold">{formatCurrency(patient.valor_total)}</span>
              </div>
              <div className="flex items-center text-sm justify-between">
                <span className="text-secondary-500">Valor Pago</span>
                <span className="text-green-600 font-bold">{formatCurrency(patient.valor_pago)}</span>
              </div>
              <div className="flex items-center text-sm justify-between">
                <span className="text-secondary-500">Risco Inadimplência</span>
                <span className={`font-bold ${patient.risco_inadimplencia > 0.7 ? 'text-red-600' : patient.risco_inadimplencia > 0.3 ? 'text-amber-600' : 'text-green-600'}`}>
                  {(patient.risco_inadimplencia * 100).toFixed(0)}%
                </span>
              </div>

              <div className="py-2 border-t border-dashed border-secondary-100 my-2"></div>

              <div className="text-sm">
                <p className="text-xs text-secondary-400 mb-1">Último Tratamento:</p>
                <p className="font-medium text-secondary-800">{patient.descricao_ultimo_tratamento}</p>
              </div>
              <div className="text-sm">
                <p className="text-xs text-secondary-400 mb-1">Dentista Responsável:</p>
                <p className="font-medium text-secondary-800">{patient.dentista}</p>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-100">
                <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-1">LGPD Compliance</p>
                <p className="text-xs text-green-800 font-medium">Consentimento ativo.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Treatments List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Histórico de Tratamentos" description="Todos os procedimentos realizados por este paciente">
            <div className="space-y-4">
              {treatmentsData?.treatments.length > 0 ? (
                treatmentsData.treatments.map((t: any) => (
                  <div key={t.id} className="group relative flex items-center justify-between p-4 rounded-xl border border-secondary-100 bg-white hover:border-primary-200 hover:shadow-soft transition-all">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-secondary-50 flex items-center justify-center mr-4 group-hover:bg-primary-50 transition-colors">
                        <Stethoscope className="h-5 w-5 text-secondary-400 group-hover:text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-secondary-900">{t.descricao}</p>
                        <p className="text-xs text-secondary-500">{formatDate(t.data_inicio)} &bull; {formatCurrency(t.valor_total)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={t.status === 'pago' ? 'success' : t.status === 'atrasado' ? 'error' : 'primary'}>
                        {t.status}
                      </Badge>
                      <Link href={`/treatments/${t.id}`}>
                        <Button variant="ghost" size="sm" className="p-2">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-secondary-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Este paciente ainda não possui tratamentos.</p>
                  <Link href={`/treatments/new?patient_id=${id}`}>
                    <Button variant="outline" size="sm" className="mt-4">Iniciar Primeiro Tratamento</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
