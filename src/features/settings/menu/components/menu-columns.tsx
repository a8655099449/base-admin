import { type ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type MenuItem } from '@/api/menu'

export const getMenuColumns = (
  onEdit: (row: MenuItem) => void,
  onAddButton: (row: MenuItem) => void,
  onDelete: (row: MenuItem) => void,
  onQuickPermission: (row: MenuItem) => void
): ColumnDef<MenuItem>[] => [
  {
    accessorKey: 'title',
    header: '菜单标题/按钮名称',
  },
  {
    accessorKey: 'type',
    header: '类型',
    cell: ({ row }) => {
      const type = row.original.type
      return (
        <Badge variant={type === 1 ? 'default' : 'secondary'}>
          {type === 1 ? '菜单' : '按钮'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'icon',
    header: '图标',
    cell: ({ getValue }) => {
      const icon = getValue() as string
      return icon || '-'
    },
  },
  {
    accessorKey: 'menuSort',
    header: '排序',
  },
  {
    accessorKey: 'path',
    header: '路径/权限标识',
    cell: ({ row }) => {
      const { type, path, permission } = row.original
      if (type === 2) return <span className='text-muted-foreground'>{permission}</span>
      return <span className='truncate max-w-[200px] block' title={path}>{path}</span>
    },
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className='flex items-center gap-2'>
          <Button
            variant='link'
            className='h-auto p-0'
            onClick={() => onEdit(item)}
          >
            编辑
          </Button>
          {item.type === 1 && (
            <>
              <Button
                variant='link'
                className='h-auto p-0 text-blue-600'
                onClick={() => onAddButton(item)}
              >
                添加按钮
              </Button>
              <Button
                variant='link'
                className='h-auto p-0 text-orange-600'
                onClick={() => onQuickPermission(item)}
              >
                快速权限
              </Button>
            </>
          )}
          <Button
            variant='link'
            className='h-auto p-0 text-destructive'
            onClick={() => onDelete(item)}
          >
            删除
          </Button>
        </div>
      )
    },
  },
]
