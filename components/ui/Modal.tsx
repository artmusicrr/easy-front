'use client'

import React, { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-secondary-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={cn(
          'relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4 bg-secondary-50/50">
          <h3 className="text-lg font-bold text-secondary-900">{title}</h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
