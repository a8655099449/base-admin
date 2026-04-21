import * as React from 'react'
import {
  type ColumnDef,
  type ExpandedState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  type Table,
} from '@tanstack/react-table'

export type TableSize = 'default' | 'middle' | 'small' | 'mini'

export interface TableBorder {
  wrapper?: boolean
  headerCell?: boolean
  bodyCell?: boolean
  cell?: boolean
}

export interface RowSelectionProps<T> {
  type?: 'checkbox' | 'radio'
  selectedRowKeys?: React.Key[]
  onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void
  onSelect?: (record: T, selected: boolean, selectedRows: T[]) => void
  onSelectAll?: (selected: boolean, selectedRows: T[]) => void
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void
  checkAll?: boolean
  columnWidth?: number | string
  columnTitle?: React.ReactNode
  fixed?: boolean
  getCheckboxProps?: (record: T) => { disabled?: boolean }
}

export interface PaginationProps {
  current?: number
  pageSize?: number
  total?: number
  showTotal?: boolean | ((total: number) => React.ReactNode)
  size?: 'default' | 'small'
  onChange?: (page: number, pageSize: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  showJumper?: boolean
  hideOnSinglePage?: boolean
}

export interface DataTableProps<TData> {
  /** 表格数据 */
  data: TData[]
  /** 列定义 */
  columns: ColumnDef<TData, any>[]
  /** 是否在加载中 */
  loading?: boolean
  /** 表格尺寸 */
  size?: TableSize
  /** 是否开启斑马纹 */
  stripe?: boolean
  /** 是否开启鼠标悬浮效果 */
  hover?: boolean
  /** 是否显示表头 */
  showHeader?: boolean
  /** 边框设置 */
  border?: boolean | TableBorder
  /** 是否显示单元格边框 */
  borderCell?: boolean
  /** 表格的 table-layout 属性 */
  tableLayoutFixed?: boolean
  /** 节点类名 */
  className?: string
  /** 节点样式 */
  style?: React.CSSProperties
  /** 设置x轴或y轴的滚动 */
  scroll?: { x?: number | string | boolean; y?: number | string | boolean }

  /** 行 key 的取值字段 */
  rowKey?: string | ((record: TData) => string)
  /** 表格行的类名 */
  rowClassName?: (record: TData, index: number) => string
  /** 设置表格行是否可选 */
  rowSelection?: RowSelectionProps<TData>

  /** 分页器设置 */
  pagination?: PaginationProps | boolean
  /** 设置分页器的位置 */
  pagePosition?: 'br' | 'bl' | 'tr' | 'tl' | 'topCenter' | 'bottomCenter'

  /** 默认展开所有可展开的行 */
  defaultExpandAllRows?: boolean
  /** 树形数据每个层级向左偏移的像素 */
  indentSize?: number
  /** 树形数据在 data 中的字段名 */
  childrenColumnName?: string
  /** 默认展开的行 */
  defaultExpandedRowKeys?: React.Key[]
  /** 展开的行（受控） */
  expandedRowKeys?: React.Key[]
  /** 点击展开的回调 */
  onExpand?: (record: TData, expanded: boolean) => void
  /** 点击展开时触发，参数为展开行数组 */
  onExpandedRowsChange?: (expandedRows: React.Key[]) => void
  /** 点击展开额外的行，渲染函数 */
  expandedRowRender?: (record: TData, index: number) => React.ReactNode

  /** 表格开启虚拟滚动 */
  virtualized?: boolean
  /** 用于配置虚拟滚动 */
  virtualListProps?: {
    height?: number | string
    fixed?: boolean
    threshold?: number
  }

  /** 没有数据的时候显示的元素 */
  noDataElement?: React.ReactNode
  /** 当单元格内容为空时，显示占位符 */
  placeholder?: React.ReactNode
  /** 表头是否显示下一次排序的 tooltip 提示 */
  showSorterTooltip?: boolean
  /** 分页、排序、筛选时的回调 */
  onChange?: (
    pagination: PaginationProps,
    sorter: any,
    filters: any,
    extra: { currentData: TData[]; action: 'paginate' | 'sort' | 'filter' }
  ) => void

  /** 表格底栏 */
  footer?: (currentData: TData[]) => React.ReactNode
  /** 总结栏 */
  summary?: (currentData: TData[]) => React.ReactNode
  /** 设置表格行的各项事件回调 */
  onRow?: (record: TData, index: number) => React.HTMLAttributes<HTMLTableRowElement>
  /** 设置表头行单元格的各项事件回调 */
  onHeaderRow?: (columns: ColumnDef<TData, any>[], index: number) => React.HTMLAttributes<HTMLTableRowElement>
}

// Internal interface for the component reference
export interface DataTableRef<TData> {
  table: Table<TData>
  reload: () => void
}
