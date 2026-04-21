import * as React from 'react'
import {
  type ColumnDef,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as TanstackTable,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table/pagination'
import { VirtualTableBody } from './virtual-table-body'
import { type DataTableProps, type DataTableRef } from './types'
import { cn } from '@/lib/utils'
import { tableVariants, cellVariants, headerVariants } from './styles'

export const DataTable = React.forwardRef(<TData,>(
  props: DataTableProps<TData>,
  ref: React.ForwardedRef<DataTableRef<TData>>
) => {
  const {
    data,
    columns: initialColumns,
    loading,
    size = 'default',
    stripe = false,
    hover = true,
    showHeader = true,
    border = false,
    borderCell = false,
    tableLayoutFixed = false,
    className,
    style,
    scroll,
    rowKey = 'id',
    rowClassName,
    rowSelection,
    pagination = true,
    pagePosition = 'br',
    childrenColumnName = 'children',
    indentSize = 15,
    expandedRowKeys,
    onExpand,
    onExpandedRowsChange,
    getSubRows: initialGetSubRows,
    onRow,
    noDataElement = '暂无数据',
    virtualized = false,
    virtualListProps,
    table: externalTable,
  } = props

  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // Merge border settings
  const borderConfig = typeof border === 'boolean' ? { wrapper: border } : border
  const showCellBorder = borderCell || borderConfig.cell

  // Managed expansion state (Controlled vs Uncontrolled)
  const [internalExpanded, setInternalExpanded] = React.useState<ExpandedState>({})
  const expanded = React.useMemo(() => {
    if (expandedRowKeys) {
      const state: ExpandedState = {}
      expandedRowKeys.forEach(key => {
        state[String(key)] = true
      })
      return state
    }
    return internalExpanded
  }, [expandedRowKeys, internalExpanded])

  const onExpandedChange = (updaterOrValue: any) => {
    const nextState = typeof updaterOrValue === 'function' ? updaterOrValue(expanded) : updaterOrValue
    setInternalExpanded(nextState)
    if (onExpandedRowsChange) {
      onExpandedRowsChange(Object.keys(nextState))
    }
  }

  // Automatic Selection Column
  const columns = React.useMemo(() => {
    if (!rowSelection) return initialColumns

    const selectionColumn: ColumnDef<TData, any> = {
      id: 'selection',
      size: typeof rowSelection.columnWidth === 'number' ? rowSelection.columnWidth : 40,
      header: ({ table: _table }) => (
        <div className='flex items-center justify-center'>
          <Checkbox
            checked={_table.getIsAllPageRowsSelected() || (_table.getIsSomePageRowsSelected() && 'indeterminate')}
            onCheckedChange={(value) => _table.toggleAllPageRowsSelected(!!value)}
            aria-label='Select all'
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
            disabled={rowSelection.getCheckboxProps?.(row.original).disabled}
          />
        </div>
      ),
    }
    return [selectionColumn, ...initialColumns]
  }, [initialColumns, rowSelection])

  const internalTable = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange,
    getSubRows: initialGetSubRows || ((row: any) => row[childrenColumnName]),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: (row: any, index: number) => {
      if (typeof rowKey === 'function') return rowKey(row)
      return String(row[rowKey] ?? index)
    },
    onPaginationChange: (updater) => {
      const nextPagination = typeof updater === 'function' ? updater(internalTable.getState().pagination) : updater
      internalTable.setPagination(nextPagination)
      if (props.onChange) {
        props.onChange(
          { current: nextPagination.pageIndex + 1, pageSize: nextPagination.pageSize },
          null,
          null,
          { currentData: data, action: 'paginate' }
        )
      }
    },
    manualPagination: false,
  })

  // Final table instance to use
  const table = (externalTable as any) || internalTable

  React.useImperativeHandle(ref, () => ({
    table,
    reload: () => {},
  }))

  return (
    <div className={cn('flex flex-col space-y-4', className)} style={style}>
      {/* Top Pagination */}
      {pagination && (pagePosition.startsWith('t') || pagePosition === 'topCenter') && (
        <div className={cn('flex', {
          'justify-end': pagePosition === 'tr',
          'justify-start': pagePosition === 'tl',
          'justify-center': pagePosition === 'topCenter'
        })}>
          <DataTablePagination table={table} {...(typeof pagination === 'object' ? pagination : {})} />
        </div>
      )}

      <div 
        ref={scrollContainerRef}
        className={cn(
          'relative overflow-hidden transition-all',
          borderConfig.wrapper && 'rounded-md border',
          (scroll?.y || virtualized) && 'overflow-y-auto'
        )} 
        style={{ maxHeight: scroll?.y || (virtualized ? (virtualListProps?.height || 400) : undefined) }}
      >
        <Table className={cn(
          tableVariants({ size, stripe, hover }),
          tableLayoutFixed && 'table-fixed'
        )}>
          {showHeader && (
            <TableHeader className={cn(borderConfig.headerCell && 'border-b')}>
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => (
                    <TableHead key={header.id} className={headerVariants({ border: showCellBorder })}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  加载中...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              virtualized ? (
                <VirtualTableBody
                  table={table}
                  scrollContainerRef={scrollContainerRef}
                  virtualListProps={virtualListProps}
                  showCellBorder={showCellBorder}
                  rowClassName={rowClassName}
                  onRow={props.onRow}
                />
              ) : (
                table.getRowModel().rows.map((row: any, index: number) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={rowClassName?.(row.original, index)}
                    {...(props.onRow?.(row.original, index) as any)}
                  >
                    {row.getVisibleCells().map((cell: any) => {
                      // More robust first-content-column check
                      const visibleColumns = table.getVisibleFlatColumns()
                      const firstContentColumnIndex = rowSelection ? 1 : 0
                      const isFirstContentColumn = cell.column.id === visibleColumns[firstContentColumnIndex]?.id

                      return (
                        <TableCell key={cell.id} className={cellVariants({ border: showCellBorder })}>
                          <div className='flex items-center'>
                            {isFirstContentColumn && (
                              <>
                                <div style={{ width: `${row.depth * indentSize}px` }} />
                                {row.getCanExpand() ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      row.toggleExpanded()
                                      props.onExpand?.(row.original, row.getIsExpanded())
                                    }}
                                    className='mr-2 flex h-4 w-4 items-center justify-center rounded hover:bg-muted'
                                  >
                                    {row.getIsExpanded() ? (
                                      <ChevronDown className='h-3 w-3' />
                                    ) : (
                                      <ChevronRight className='h-3 w-3' />
                                    )}
                                  </button>
                                ) : (
                                  <div className='mr-2 w-4' />
                                )}
                              </>
                            )}
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>
                  {noDataElement}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Pagination */}
      {pagination && (pagePosition.startsWith('b') || pagePosition === 'bottomCenter') && (
        <div className={cn('flex', {
          'justify-end': pagePosition === 'br',
          'justify-start': pagePosition === 'bl',
          'justify-center': pagePosition === 'bottomCenter'
        })}>
          <DataTablePagination table={table} {...(typeof pagination === 'object' ? pagination : {})} />
        </div>
      )}
    </div>
  )
})

DataTable.displayName = 'DataTable'
