import * as React from 'react'
import { type Row, type Table, flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { TableRow, TableCell } from '@/components/ui/table'
import { cellVariants } from './styles'

interface VirtualTableBodyProps<TData> {
  table: Table<TData>
  virtualListProps?: {
    height?: number | string
    threshold?: number
  }
  showCellBorder?: boolean
  rowClassName?: (record: TData, index: number) => string
  onRow?: (record: TData, index: number) => React.HTMLAttributes<HTMLTableRowElement>
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
}

export function VirtualTableBody<TData>({
  table,
  virtualListProps,
  showCellBorder,
  rowClassName,
  onRow,
  scrollContainerRef,
}: VirtualTableBodyProps<TData>) {
  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 40, // Estimate row height
    overscan: virtualListProps?.threshold || 5,
  })

  const { getVirtualItems, getTotalSize } = rowVirtualizer
  const virtualItems = getVirtualItems()
  const paddingTop = virtualItems.length > 0 ? virtualItems?.[0]?.start || 0 : 0
  const paddingBottom =
    virtualItems.length > 0
      ? getTotalSize() - (virtualItems?.[virtualItems.length - 1]?.end || 0)
      : 0

  return (
    <>
      {paddingTop > 0 && (
        <tr>
          <td style={{ height: `${paddingTop}px` }} />
        </tr>
      )}
      {virtualItems.map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<TData>
        return (
          <TableRow
            key={row.id}
            data-index={virtualRow.index}
            ref={(node) => rowVirtualizer.measureElement(node)}
            data-state={row.getIsSelected() && 'selected'}
            className={rowClassName?.(row.original, virtualRow.index)}
            {...(onRow?.(row.original, virtualRow.index) as any)}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cellVariants({ border: showCellBorder })}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        )
      })}
      {paddingBottom > 0 && (
        <tr>
          <td style={{ height: `${paddingBottom}px` }} />
        </tr>
      )}
    </>
  )
}
