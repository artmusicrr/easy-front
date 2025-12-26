'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/schemas'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Carrega o tema inicial
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Aplica o tema no DOM
  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setError(null)
    setIsLoading(true)

    try {
      await login(data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao realizar login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Brand/Image Section (Hidden on mobile, visible on lg screens) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden" style={{ backgroundColor: 'rgba(0, 102, 204, 0.05)' }}>
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Modern bright dental clinic office interior with blue dental chair" 
            className="w-full h-full object-cover opacity-90" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJrhdc05kDsQpfPdU_EEioMlx1r8UFsGAWT-4Pd8ShaZu-B91JbtJ1MI63XfDmWdlWsHvdLnB8l6qqi-XR7ZFw1LEmxUVFRECgaCkvdbXVe8N-PIqRY-CbWR7XGaM0drDhEUUrEoFAv9D91ja5O4la6AdtBwDvsiW4yC3ZpNUXS9dCdWRTiQOHN41ZvgCsgChwgJu_q8kAkMowExyBrW2ajStljR_uvU3_F5q3M-IRcEi90zzrNXwIuHidBd1ibWhwRCsnkwjIlwMI"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0066cc]/90 to-[#0066cc]/40"></div>
        </div>

        <div className="relative z-10 p-12 h-full flex flex-col justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">EasyCore</span>
          </div>

          <div className="max-w-md mb-12">
            <h1 className="text-4xl font-bold leading-tight mb-6">
              Gestão Odontológica Inteligente e Simplificada.
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Gerencie sua clínica com eficiência. Agendamentos, prontuários e financeiro em um único lugar, 
              projetado para dentistas e gestores.
            </p>
          </div>

          <div className="text-sm text-white/70">
            © 2025 EasyCore Systems. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#ffffff] dark:bg-[#1a2632] transition-colors relative">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-lg border transition-colors"
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#dae0e7',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
          }}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5" style={{ color: '#101418' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>

        <div className="w-full max-w-[420px] flex flex-col gap-8">
          {/* Mobile Logo (Visible only on smaller screens) */}
          <div className="lg:hidden flex justify-center mb-4">
            <div className="flex items-center gap-2" style={{ color: '#0066cc' }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-2xl font-bold text-[#101418] dark:text-white">EasyCore</span>
            </div>
          </div>

          {/* Header Text */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-[#101418] dark:text-white">
              Bem-vindo de volta
            </h2>
            <p className="text-base text-[#5e758d] dark:text-gray-400">
              Insira suas credenciais para acessar a plataforma.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#101418] dark:text-gray-200" htmlFor="email">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  className={`w-full h-12 rounded-lg border px-4 pr-10 focus:outline-none focus:ring-2 transition-all bg-white dark:bg-gray-800 text-[#101418] dark:text-white placeholder:text-gray-400 ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-[#dae0e7] dark:border-gray-600 focus:ring-[#0066cc]/50 focus:border-[#0066cc]'
                  }`}
                  id="email"
                  placeholder="exemplo@easycore.com"
                  type="text"
                />
                <svg className="absolute right-4 top-3.5 h-5 w-5 pointer-events-none text-[#5e758d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[#101418] dark:text-gray-200" htmlFor="password">
                  Senha
                </label>
                <a className="text-sm font-medium hover:underline transition-colors text-[#0066cc] hover:text-[#0052a3]" href="#">
                  Esqueci minha senha
                </a>
              </div>
              <div className="relative">
                <input
                  {...register('senha')}
                  className={`w-full h-12 rounded-lg border px-4 pr-12 focus:outline-none focus:ring-2 transition-all bg-white dark:bg-gray-800 text-[#101418] dark:text-white placeholder:text-gray-400 ${
                    errors.senha 
                      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-[#dae0e7] dark:border-gray-600 focus:ring-[#0066cc]/50 focus:border-[#0066cc]'
                  }`}
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center transition-colors focus:outline-none text-[#5e758d] hover:text-[#0066cc]"
                  type="button"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="text-red-500 text-xs mt-1">{errors.senha.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={isLoading}
              className="w-full h-12 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2 bg-[#0066cc] hover:bg-[#0052a3] disabled:bg-[#5c9fdb]"
              type="submit"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer / Sign Up Link */}
          <div className="text-center pt-4 border-t border-[#dae0e7] dark:border-gray-700">
            <p className="text-sm text-[#5e758d] dark:text-gray-400">
              Ainda não tem acesso?{' '}
              <a className="font-medium hover:underline text-[#0066cc] hover:text-[#0052a3]" href="#">
                Fale com o administrador
              </a>
            </p>
          </div>

          {/* Support/Help Quick Links */}
          <div className="flex justify-center gap-6 mt-4">
            <a className="text-xs transition-colors text-[#5e758d] dark:text-gray-500 hover:text-[#101418] dark:hover:text-gray-300" href="#">
              Termos de Uso
            </a>
            <a className="text-xs transition-colors text-[#5e758d] dark:text-gray-500 hover:text-[#101418] dark:hover:text-gray-300" href="#">
              Política de Privacidade
            </a>
            <a className="text-xs transition-colors text-[#5e758d] dark:text-gray-500 hover:text-[#101418] dark:hover:text-gray-300" href="#">
              Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
