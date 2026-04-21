import * as React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import type { MenuItem, MenuParams } from '@/api/menu'

const formSchema = z.object({
  id: z.number().optional(),
  pid: z.string().or(z.number()),
  type: z.number(),
  title: z.string().min(1, '名称不能为空'),
  path: z.string().optional(),
  permission: z.string().optional(),
  icon: z.string().optional(),
  menuSort: z.number().default(99),
  hidden: z.boolean().default(false),
})

interface MenuActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data?: Partial<MenuItem> | null
  menus: MenuItem[]
  onSubmit: (data: MenuParams) => Promise<void>
}

export function MenuActionDialog({
  open,
  onOpenChange,
  data,
  menus,
  onSubmit,
}: MenuActionDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pid: '0',
      type: 1,
      title: '',
      path: '',
      permission: '',
      icon: '',
      menuSort: 99,
      hidden: false,
    },
  })

  React.useEffect(() => {
    if (data) {
      form.reset({
        id: data.id,
        pid: data.pid?.toString() || '0',
        type: data.type || 1,
        title: data.title || '',
        path: data.path || '',
        permission: data.permission || '',
        icon: data.icon || '',
        menuSort: data.menuSort || 99,
        hidden: data.hidden || false,
      })
    } else {
      form.reset({
        pid: '0',
        type: 1,
        title: '',
        path: '',
        permission: '',
        icon: '',
        menuSort: 99,
        hidden: false,
      })
    }
  }, [data, form, open])

  const type = useWatch({
    control: form.control,
    name: 'type',
  })

  const flattenedMenus = React.useMemo(() => {
    const result: { id: string; title: string; depth: number }[] = [
      { id: '0', title: '顶级', depth: 0 },
    ]
    const traverse = (items: MenuItem[], depth = 1) => {
      items.forEach((item) => {
        if (item.type === 1) {
          result.push({ id: item.id.toString(), title: item.title, depth })
          if (item.children) {
            traverse(item.children, depth + 1)
          }
        }
      })
    }
    traverse(menus)
    return result
  }, [menus])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{data?.id ? '编辑菜单' : '添加菜单'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>菜单类型</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(v) => field.onChange(parseInt(v))}
                        defaultValue={field.value.toString()}
                        className='flex space-x-4'
                      >
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='1' id='type-1' />
                          <label htmlFor='type-1'>菜单/目录</label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='2' id='type-2' />
                          <label htmlFor='type-2'>按钮</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{type === 2 ? '按钮名称' : '菜单标题'}</FormLabel>
                    <FormControl>
                      <Input placeholder='请输入名称' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='pid'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上级类目</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='选择上级类目' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {flattenedMenus.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <span style={{ paddingLeft: `${(m.depth) * 12}px` }}>
                              {m.title}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === 1 ? (
                <>
                  <FormField
                    control={form.control}
                    name='icon'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>菜单图标</FormLabel>
                        <FormControl>
                          <Input placeholder='图标名称 (如: Home)' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='path'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>路由地址</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入路径' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name='permission'
                  render={({ field }) => (
                    <FormItem className='col-span-1'>
                      <FormLabel>权限标识</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入权限标识' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='menuSort'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>菜单排序</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='hidden'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>是否隐藏</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(v) => field.onChange(v === 'true')}
                        defaultValue={field.value.toString()}
                        className='flex space-x-4'
                      >
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='false' id='hidden-false' />
                          <label htmlFor='hidden-false'>显示</label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='true' id='hidden-true' />
                          <label htmlFor='hidden-true'>隐藏</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className='pt-4'>
              <Button type='submit' loading={form.formState.isSubmitting}>
                提交
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
