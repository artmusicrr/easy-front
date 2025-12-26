'use client'

import React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  pageCount?: number
  pageIndex?: number
  onPageChange?: (page: number) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  pageCount,
<<<<<<< HEAD
  pageIndex = 1,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount || -1,
    state: {
      pagination: {
        pageIndex: pageIndex - 1, // ReactTable 0-indexed
        pageSize: 10,
      },
    },
    manualPagination: !!pageCount,
=======
  pageIndex,
  onPageChange,
}: DataTableProps<TData, TValue> & { 
  pageCount?: number
  pageIndex?: number
  onPageChange?: (page: number) => void 
}) {
  const isManual = pageCount !== undefined

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: isManual ? {
      pagination: {
        pageIndex: pageIndex || 0,
        pageSize: 10, // Assuming fixed page size for now or inherited
      },
    } : undefined,
    manualPagination: isManual,
    onPaginationChange: isManual ? (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: pageIndex || 0,
          pageSize: 10,
        })
        onPageChange?.(newState.pageIndex)
      } else {
        onPageChange?.(updater.pageIndex)
      }
    } : undefined,
>>>>>>> b576676 (ajuste da branch)
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isManual ? undefined : getPaginationRowModel(),
  })

  return (
    <div className="w-full">
      <div className="rounded-xl border border-secondary-200 bg-white overflow-hidden shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left font-semibold text-secondary-600 h-10"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"></div>
                    <span className="text-secondary-500">Carregando dados...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-secondary-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-secondary-700">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-secondary-500">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-secondary-500">
          Mostrando {table.getRowModel().rows.length} de {data.length} registros
          {pageCount && ` (Página ${pageIndex} de ${pageCount})`}
        </div>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 rounded-md border border-secondary-200 bg-white text-sm text-secondary-600 disabled:opacity-50 hover:bg-secondary-50 transition-colors"
            onClick={() => onPageChange ? onPageChange(pageIndex - 1) : table.previousPage()}
            disabled={onPageChange ? pageIndex <= 1 : !table.getCanPreviousPage()}
          >
            Anterior
          </button>
          <button
            className="px-3 py-1 rounded-md border border-secondary-200 bg-white text-sm text-secondary-600 disabled:opacity-50 hover:bg-secondary-50 transition-colors"
            onClick={() => onPageChange ? onPageChange(pageIndex + 1) : table.nextPage()}
            disabled={onPageChange ? pageIndex >= (pageCount || 1) : !table.getCanNextPage()}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  )
}
