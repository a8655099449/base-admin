import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  type PaginationState,
  type SortingState,
  type ColumnFiltersState,
  type ExpandedState,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import type { ProTableProps } from './types'

export function useProTable<TData>(props: ProTableProps<TData>) {
  const { 
    columns, 
    request, 
    baseRequestUrl, 
    params: extraParams,
    onSearchTransform,
    getSubRows,
    onExpandedChange
  } = props

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [expanded, setExpanded] = React.useState<ExpandedState>({})

  const { data, isLoading, refetch } = useQuery({
    queryKey: [baseRequestUrl || 'table', pagination, sorting, columnFilters, extraParams, onSearchTransform, request],
    queryFn: async () => {
      let searchParams = columnFilters.reduce((acc, filter) => {
        acc[filter.id] = filter.value
        return acc
      }, {} as Record<string, unknown>)

      if (onSearchTransform) {
        searchParams = onSearchTransform(searchParams)
      }

      const finalParams = {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        ...searchParams,
        ...extraParams,
      }

      if (request) {
        return request(finalParams)
      }

      return { data: [], total: 0 }
    },
  })

  /* eslint-disable react-hooks/incompatible-library */
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: {
      pagination,
      sorting,
      columnFilters,
      expanded,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: (updater) => {
      const nextExpanded = typeof updater === 'function' ? updater(expanded) : updater
      setExpanded(nextExpanded)
      onExpandedChange?.(nextExpanded)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows,
    manualPagination: true,
    pageCount: Math.ceil((data?.total ?? 0) / pagination.pageSize),
  })

  return {
    table,
    isLoading,
    reload: refetch,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
  }
}
