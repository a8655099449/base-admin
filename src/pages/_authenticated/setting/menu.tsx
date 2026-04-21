import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Minus, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ProTable } from '@/components/pro-table/pro-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { 
  getSuperiorMenusApi, 
  createMenuApi, 
  updateMenuApi, 
  deleteMenuApi, 
  type MenuItem,
  type MenuParams
} from '@/api/menu'
import { getMenuColumns } from '@/features/settings/menu/components/menu-columns'
import { MenuActionDialog } from '@/features/settings/menu/components/menu-action-dialog'

export const Route = createFileRoute('/_authenticated/setting/menu')({
  component: MenuManagement,
})

function MenuManagement() {
  const [currentRow, setCurrentRow] = React.useState<Partial<MenuItem> | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [allMenus, setAllMenus] = React.useState<MenuItem[]>([])
  const [isAllExpanded, setIsAllExpanded] = React.useState(false)
  const tableRef = React.useRef<{ reload: () => void; table: import('@tanstack/react-table').Table<MenuItem> }>(null)

  const MOCK_DATA: MenuItem[] = [
    {
      id: 1,
      title: '仪表盘',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      type: 1,
      menuSort: 1,
      children: [
        { id: 11, pid: 1, title: '分析页', path: '/dashboard/analysis', type: 1, menuSort: 1 },
        { id: 12, pid: 1, title: '监控页', path: '/dashboard/monitor', type: 1, menuSort: 2 },
      ]
    },
    {
      id: 2,
      title: '系统管理',
      path: '/system',
      icon: 'Settings',
      type: 1,
      menuSort: 2,
      children: [
        {
          id: 21,
          pid: 2,
          title: '用户管理',
          path: '/system/user',
          type: 1,
          menuSort: 1,
          children: [
            { id: 211, pid: 21, title: '查询用户', permission: 'system.user.list', type: 2, menuSort: 1 },
            { id: 212, pid: 21, title: '新增用户', permission: 'system.user.add', type: 2, menuSort: 2 },
          ]
        },
        { id: 22, pid: 2, title: '角色管理', path: '/system/role', type: 1, menuSort: 2 },
        { id: 23, pid: 2, title: '菜单管理', path: '/system/menu', type: 1, menuSort: 3 },
      ]
    }
  ]

  const fetchMenus = async () => {
    // const res = await getSuperiorMenusApi()
    setAllMenus(MOCK_DATA)
    return {
      data: MOCK_DATA,
      total: MOCK_DATA.length,
    }
  }

  const handleAdd = () => {
    setCurrentRow(null)
    setDialogOpen(true)
  }

  const handleEdit = (row: MenuItem) => {
    setCurrentRow(row)
    setDialogOpen(true)
  }

  const handleAddButton = (row: MenuItem) => {
    setCurrentRow({ pid: row.id, type: 2 })
    setDialogOpen(true)
  }

  const handleDelete = (row: MenuItem) => {
    setCurrentRow(row)
    setConfirmOpen(true)
  }

  const onConfirmDelete = async () => {
    if (!currentRow?.id) return
    try {
      await deleteMenuApi([currentRow.id as number])
      toast.success('删除成功')
      setConfirmOpen(false)
      tableRef.current?.reload()
    } catch (_error) {
      toast.error('删除失败')
    }
  }

  const handleQuickPermission = async (item: MenuItem) => {
    const prefix = item.permission || item.path?.replace(/\//g, '.')
    if (!prefix) {
      toast.error('请先设置菜单的权限标识或路径')
      return
    }

    const permissions = [
      { title: '添加', suffix: 'add' },
      { title: '编辑', suffix: 'edit' },
      { title: '删除', suffix: 'del' },
    ]

    try {
      await Promise.all(
        permissions.map((p, index) =>
          createMenuApi({
            pid: item.id,
            type: 2,
            title: `${item.title}-${p.title}`,
            permission: `${prefix}.${p.suffix}`,
            menuSort: index + 1,
            hidden: true,
          })
        )
      )
      toast.success('快速创建权限成功')
      tableRef.current?.reload()
    } catch (_error) {
      toast.error('快速创建权限失败')
    }
  }

  const handleAllExpand = () => {
    const nextValue = !isAllExpanded
    setIsAllExpanded(nextValue)
    tableRef.current?.table.toggleAllRowsExpanded(nextValue)
  }

  const onSubmit = async (values: MenuParams) => {
    try {
      if (currentRow?.id) {
        await updateMenuApi({ ...values, id: currentRow.id as number })
        toast.success('更新成功')
      } else {
        await createMenuApi(values)
        toast.success('添加成功')
      }
      setDialogOpen(false)
      tableRef.current?.reload()
    } catch (_error) {
      toast.error('操作失败')
    }
  }

  const columns = React.useMemo(() => 
    getMenuColumns(handleEdit, handleAddButton, handleDelete, handleQuickPermission), 
  [allMenus])

  return (
    <>
      <Header />
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>菜单管理</h2>
            <p className='text-muted-foreground'>
              管理系统的菜单结构、权限标识和按钮。
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleAllExpand}
            >
              {isAllExpanded ? <Minus className='mr-2 h-4 w-4' /> : <Plus className='mr-2 h-4 w-4' />}
              {isAllExpanded ? '全部收起' : '全部展开'}
            </Button>
            <Button onClick={handleAdd}>
              <PlusCircle className='mr-2 h-4 w-4' />
              添加菜单
            </Button>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <ProTable<MenuItem>
            columns={columns}
            request={fetchMenus}
            getSubRows={(row) => row.children}
            pagination={false}
            ref={tableRef}
          />
        </div>
      </Main>

      <MenuActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={currentRow}
        menus={allMenus}
        onSubmit={onSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title='确认删除'
        desc={`是否确认删除菜单 [${currentRow?.title}] 及其所有子项？`}
        handleConfirm={onConfirmDelete}
        destructive
      />
    </>
  )
}
