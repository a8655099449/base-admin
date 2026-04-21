import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { SearchForm } from './search-form'
import { useProTable } from './use-pro-table'
import { type ProTableProps } from './types'

export const ProTable = React.forwardRef(<TData,>(
  props: ProTableProps<TData>,
  ref: React.ForwardedRef<{ reload: () => void; table: import('@tanstack/react-table').Table<TData> }>
) => {
  const {
    columns,
    request,
    baseRequestUrl,
    method,
    onSearchTransform,
    params,
    toolBarRender,
    tableProps,
    getSubRows,
    onExpandedChange,
    pagination = true,
    permission,
  } = props

  const {
    table,
    isLoading,
    reload,
    setColumnFilters,
  } = useProTable({
    columns,
    request,
    baseRequestUrl,
    method,
    onSearchTransform,
    params,
    getSubRows,
    onExpandedChange,
  })

  React.useImperativeHandle(ref, () => ({
    reload,
    table,
  }))

  return (
    <div className='flex flex-col space-y-4'>
      <SearchForm
        columns={columns}
        onSearch={(values) => {
          const filters = Object.entries(values)
            .filter(([_, value]) => value !== undefined && value !== '')
            .map(([id, value]) => ({ id, value }))
          setColumnFilters(filters)
        }}
        onReset={() => {
          setColumnFilters([])
        }}
        permission={permission}
      />

      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          {toolBarRender?.()}
        </div>
      </div>

      <DataTable
        data={[]} // DataTable will use data from external table if provided
        columns={columns as any}
        loading={isLoading}
        table={table as any}
        pagination={pagination}
        {...tableProps}
      />
    </div>
  )
})

ProTable.displayName = 'ProTable'
