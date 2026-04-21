import { type ColumnDef, type ExpandedState } from '@tanstack/react-table'

export type ProValueType = 'text' | 'select' | 'date' | 'dateRange' | 'dateTime' | 'switch' | 'deptTree'

export interface ProColumnMeta {
  search?: boolean | {
    type?: ProValueType
    order?: number
    defaultValue?: unknown
    props?: Record<string, unknown>
  }
  valueType?: ProValueType
  options?: { label: string; value: unknown }[]
  hideInTable?: boolean
  hideInSearch?: boolean
  hideInForm?: boolean
  hideInDetail?: boolean
  formProps?: Record<string, unknown>
  className?: string
  thClassName?: string
  tdClassName?: string
}

export type ProColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  meta?: ProColumnMeta
  title?: string // Convenience for search label
}

export interface ProTableProps<TData> {
  columns: ProColumnDef<TData, unknown>[]
  request?: (params: Record<string, unknown>) => Promise<{ data: TData[]; total: number }>
  baseRequestUrl?: string
  method?: 'get' | 'post'
  onSearchTransform?: (params: Record<string, unknown>) => Record<string, unknown>
  params?: Record<string, unknown> // Extra fixed params
  rowKey?: keyof TData | ((row: TData) => string)
  toolBarRender?: () => React.ReactNode
  onEditRow?: (row: TData) => void
  onDeleteRow?: (row: TData) => Promise<void>
  onViewRow?: (row: TData) => void
  formModalProps?: Record<string, unknown>
  searchFormProps?: Record<string, unknown>
  tableProps?: Record<string, unknown>
  permission?: string
  // Tree support
  getSubRows?: (row: TData) => TData[] | undefined
  onExpandedChange?: (expanded: ExpandedState) => void
  pagination?: boolean
}
