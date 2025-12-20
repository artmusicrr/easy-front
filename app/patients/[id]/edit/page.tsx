'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema, PatientInput } from '@/schemas'
import { patientService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, User, Phone, Mail, Fingerprint, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { maskCPF } from '@/utils/utils'

export default function EditPatientPage() {
    const router = useRouter()
    const { id } = useParams() as { id: string }
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { data: patient, isLoading: isLoadingData } = useQuery({
        queryKey: ['patient', id],
        queryFn: async () => {
            const response = await patientService.getById(id)
            return response.patient
        },
        enabled: !!id,
    })

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<PatientInput>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            consentimento_lgpd: false,
        }
    })

    useEffect(() => {
        if (patient) {
            reset({
                nome: patient.nome,
                // CPF criptografado não deve ser editado diretamente ou exibido sem máscara, 
                // mas aqui estamos apenas preenchendo o form.
                // O ideal seria vir descriptografado se o usuário tiver permissão, 
                // ou desabilitar edição de CPF.
                // Vamos desabilitar CPF por enquanto.
                cpf: patient.cpf_encrypted || '',
                telefone: patient.telefone || '',
                email: patient.email || '',
                consentimento_lgpd: patient.consentimento_lgpd,
            })
        }
    }, [patient, reset])

    const onSubmit = async (data: PatientInput) => {
        setIsLoading(true)
        setError(null)
        try {
            await patientService.update(id, data);
            router.push(`/patients/${id}`)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao atualizar paciente.')
        } finally {
            setIsLoading(false)
        }
    }

    // Se o CPF já vem criptografado/mascarado, melhor não mexer na máscara visual complexa
    // ou assumir que o usuário vai redigitar se quiser mudar.
    // Vamos manter simples: se quiser editar, redigita.

    if (isLoadingData) {
        return <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
            <div className="h-10 w-48 bg-secondary-200 rounded"></div>
            <div className="h-96 bg-secondary-200 rounded-xl"></div>
        </div>
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link href={`/patients/${id}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Editar Paciente</h1>
                    <p className="text-sm text-secondary-500">Atualize os dados cadastrais do paciente.</p>
                </div>
            </div>

            <Card title="Informações Pessoais" description="Dados básicos e de contato do paciente">
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 md:col-span-2">
                        <div className="relative">
                            <User className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
                            <Input
                                label="Nome Completo"
                                placeholder="Ex: Maria Oliveira Santos"
                                className="pl-10"
                                {...register('nome')}
                                error={errors.nome?.message}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <Fingerprint className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
                        <Input
                            label="CPF (Apenas leitura)"
                            disabled
                            className="pl-10 bg-secondary-50 text-secondary-500"
                            value={patient?.cpf_encrypted ? maskCPF(patient.cpf_encrypted) : ''}
                        // Não registramos o CPF para envio se for disabled/criptografado,
                        // mas o schema exige. 
                        // TODO: Ajustar schema para update parcial ou tratar CPF separadamente.
                        // Por hora, vamos enviar o valor que estiver no form, mas o input disabled não envia.
                        // O hook form controlará o valor.
                        />
                        {/* Campo oculto para manter o valor no form submit se necessário, mas update deve ser parcial idealmente */}
                        <input type="hidden" {...register('cpf')} />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
                        <Input
                            label="Telefone / WhatsApp"
                            placeholder="(11) 99999-9999"
                            className="pl-10"
                            {...register('telefone')}
                            error={errors.telefone?.message}
                        />
                    </div>

                    <div className="md:col-span-2 relative">
                        <Mail className="absolute left-3 top-9 h-4 w-4 text-secondary-400" />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="paciente@exemplo.com"
                            className="pl-10"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                    </div>

                    <div className="md:col-span-2 p-4 rounded-xl border border-primary-100 bg-primary-50/50">
                        <div className="flex items-start space-x-3">
                            <div className="mt-1">
                                <input
                                    type="checkbox"
                                    id="lgpd"
                                    className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                    {...register('consentimento_lgpd')}
                                />
                            </div>
                            <label htmlFor="lgpd" className="text-sm text-secondary-700 leading-relaxed font-medium">
                                Confirmo que o paciente forneceu consentimento para o tratamento de seus dados pessoais de acordo com a <span className="text-primary-600 font-bold">LGPD</span>.
                                Este dado é obrigatório para fins regulatórios e de segurança.
                            </label>
                        </div>
                        {errors.consentimento_lgpd && <p className="mt-2 text-xs font-medium text-red-500">{errors.consentimento_lgpd.message}</p>}
                    </div>

                    {error && (
                        <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t border-secondary-100">
                        <Link href={`/patients/${id}`}>
                            <Button variant="outline" type="button">Cancelar</Button>
                        </Link>
                        <Button type="submit" isLoading={isLoading}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
