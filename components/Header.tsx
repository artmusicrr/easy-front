import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/utils/utils'
import { Badge } from '@/components/ui/Badge'
import { Bell, Search, UserCircle, User, FileText, Loader2, X, LogOut, Settings, Shield } from 'lucide-react'
import { patientService, treatmentService } from '@/services'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<{ patients: any[]; treatments: any[] }>({ patients: [], treatments: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length >= 2) {
        setIsLoading(true)
        try {
          const [patientsData, treatmentsData] = await Promise.all([
            patientService.getAll({ search, limit: 5 }),
            treatmentService.getAll({ search, limit: 5 })
          ])
          setResults({
            patients: patientsData.patients || [],
            treatments: treatmentsData.treatments || []
          })
          setIsOpen(true)
        } catch (error) {
          console.error('Error fetching search results:', error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults({ patients: [], treatments: [] })
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const handleSelect = (href: string) => {
    setSearch('')
    setIsOpen(false)
    router.push(href)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-secondary-200 bg-white/80 px-8 backdrop-blur-md">
      <div className="flex flex-1 items-center">
        <div className="relative w-96" ref={dropdownRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar pacientes, tratamentos..."
            className="h-10 w-full rounded-full border border-secondary-200 bg-secondary-50/50 pl-10 pr-10 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => search.length >= 2 && setIsOpen(true)}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-secondary-400" />
          )}
          {!isLoading && search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {isOpen && (search.length >= 2) && (
            <div className="absolute left-0 top-full mt-2 w-full max-h-[400px] overflow-y-auto rounded-xl border border-secondary-200 bg-white shadow-xl">
              {results.patients.length === 0 && results.treatments.length === 0 ? (
                <div className="p-4 text-center text-sm text-secondary-500">
                  Nenhum resultado encontrado para "{search}"
                </div>
              ) : (
                <div className="p-2">
                  {results.patients.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-xs font-bold uppercase text-secondary-400">Pacientes</div>
                      {results.patients.map((patient: any) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelect(`/patients/${patient.id}`)}
                          className="flex w-full items-center px-3 py-2 text-left rounded-lg hover:bg-secondary-50 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-primary-500" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-medium text-secondary-900 truncate">{patient.nome}</div>
                            <div className="text-xs text-secondary-500 truncate">{patient.email || 'Sem email'}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.treatments.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-bold uppercase text-secondary-400">Tratamentos</div>
                      {results.treatments.map((treatment: any) => (
                        <button
                          key={treatment.id}
                          onClick={() => handleSelect(`/treatments/${treatment.id}`)}
                          className="flex w-full items-center px-3 py-2 text-left rounded-lg hover:bg-secondary-50 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center mr-3">
                            <FileText className="h-4 w-4 text-secondary-500" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-medium text-secondary-900 truncate">{treatment.descricao}</div>
                            <div className="text-xs text-secondary-500 truncate">Paciente: {treatment.patient.nome}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          className="relative rounded-full p-2 text-secondary-500 transition-colors hover:bg-secondary-100 hover:text-secondary-700"
          title="Notificações e Alertas"
          onClick={() => alert('Funcionalidade de notificações em desenvolvimento: Exibirá alertas de pagamentos atrasados e novas mensagens.')}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <div className="h-8 w-px bg-secondary-200 mx-2"></div>
        
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 rounded-full border border-secondary-200 p-1 pr-4 transition-colors hover:bg-secondary-50"
          >
            <div className="h-7 w-7 rounded-full bg-secondary-200 flex items-center justify-center overflow-hidden">
               <UserCircle className="h-6 w-6 text-secondary-500" />
            </div>
            <span className="text-sm font-medium text-secondary-700">Opções</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-secondary-200 bg-white shadow-xl py-2">
              <div className="px-4 py-2 border-b border-secondary-100 mb-2">
                <p className="text-sm font-bold text-secondary-900">{user?.nome || 'Usuário'}</p>
                <p className="text-xs text-secondary-500">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 uppercase">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              
              <button className="flex w-full items-center px-4 py-2 text-sm text-secondary-600 hover:bg-secondary-50 transition-colors">
                <User className="mr-3 h-4 w-4" />
                Meu Perfil
              </button>
              
              {user?.role === 'admin' && (
                <Link href="/admin/users" onClick={() => setIsUserMenuOpen(false)} className="flex w-full items-center px-4 py-2 text-sm text-secondary-600 hover:bg-secondary-50 transition-colors">
                  <Shield className="mr-3 h-4 w-4" />
                  Painel Admin
                </Link>
              )}

              <button className="flex w-full items-center px-4 py-2 text-sm text-secondary-600 hover:bg-secondary-50 transition-colors">
                <Settings className="mr-3 h-4 w-4" />
                Configurações
              </button>
              
              <div className="h-px bg-secondary-100 my-2"></div>
              
              <button 
                onClick={() => logout()}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sair do Sistema
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
