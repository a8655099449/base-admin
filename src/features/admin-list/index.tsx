import { ProTable, type ProColumnDef } from '@/components/pro-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface UserItem {
  id: number
  userName: string
  realName: string
  email: string
  mobile: string
  deptName: string
  enabled: boolean
}

const columns: ProColumnDef<UserItem>[] = [
  {
    accessorKey: 'userName',
    header: '账户名称',
    title: '账户名称',
    meta: { search: true },
  },
  {
    accessorKey: 'realName',
    header: '员工姓名',
    title: '员工姓名',
    meta: { search: true },
  },
  {
    accessorKey: 'email',
    header: '邮箱',
    title: '邮箱',
    meta: { search: true },
  },
  {
    accessorKey: 'deptName',
    header: '组织架构',
    cell: ({ row }) => {
      const deptNames = row.original.deptName?.split(',') || []
      return (
        <div className='flex flex-wrap gap-1'>
          {deptNames.map((name) => (
            <Badge key={name} variant='secondary'>
              {name}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'enabled',
    header: '状态',
    cell: ({ row }) => (
      <Badge variant={row.original.enabled ? 'default' : 'destructive'}>
        {row.original.enabled ? '启用' : '禁用'}
      </Badge>
    ),
    meta: {
      valueType: 'select',
      options: [
        { label: '启用', value: 'true' },
        { label: '禁用', value: 'false' },
      ],
    },
  },
  {
    id: 'actions',
    header: '操作',
    cell: () => (
      <div className='flex space-x-2'>
        <Button variant='ghost' size='sm'>
          编辑
        </Button>
        <Button variant='ghost' size='sm' className='text-destructive'>
          删除
        </Button>
      </div>
    ),
  },
]

export default function AdminListPage() {
  return (
    <div className='p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>管理员列表</h1>
      </div>
      
      <ProTable<UserItem>
        columns={columns}
        baseRequestUrl='/api/account/queryUser'
        toolBarRender={() => (
          <Button size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            新增管理员
          </Button>
        )}
        request={async () => {
          // 模拟请求
          return {
            data: [
              {
                id: 1,
                userName: 'admin',
                realName: '系统管理员',
                email: 'admin@example.com',
                mobile: '13800138000',
                deptName: '技术部,开发组',
                enabled: true,
              },
              {
                id: 2,
                userName: 'test',
                realName: '测试人员',
                email: 'test@example.com',
                mobile: '13800138001',
                deptName: '测试部',
                enabled: false,
              },
            ],
            total: 2,
          }
        }}
      />
    </div>
  )
}
