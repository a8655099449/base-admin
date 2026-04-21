import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, RotateCcw } from 'lucide-react'
import type { ProColumnDef } from './types'

interface SearchFormProps<TData> {
  columns: ProColumnDef<TData, unknown>[]
  onSearch: (values: Record<string, unknown>) => void
  onReset: () => void
}

export function SearchForm<TData>({
  columns,
  onSearch,
  onReset,
}: SearchFormProps<TData>) {
  const searchColumns = columns.filter((col) => col.meta?.search !== false && !col.meta?.hideInSearch)
  
  const form = useForm<Record<string, unknown>>({
    defaultValues: searchColumns.reduce((acc, col) => {
      const id = (col as { accessorKey?: string }).accessorKey || col.id
      if (id) {
        acc[id] = ''
      }
      return acc
    }, {} as Record<string, unknown>),
  })

  const onSubmit = (values: Record<string, unknown>) => {
    onSearch(values)
  }

  const handleReset = () => {
    form.reset()
    onReset()
  }

  if (searchColumns.length === 0) return null

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='grid grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 border rounded-lg bg-card mb-4'
      >
        {searchColumns.map((col) => {
          const id = (col as { accessorKey?: string }).accessorKey || col.id
          if (!id) return null
          const title = col.title || (col.header as string) || id
          const valueType = col.meta?.valueType || 'text'

          return (
            <FormField
              key={id}
              control={form.control}
              name={id}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{title}</FormLabel>
                  <FormControl>
                    {valueType === 'select' ? (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value as string}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`请选择${title}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {col.meta?.options?.map((opt) => (
                            <SelectItem key={opt.value as string} value={opt.value as string}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input placeholder={`请输入${title}`} {...field} value={(field.value as string) ?? ''} />
                    )}
                  </FormControl>
                </FormItem>
              )}
            />
          )
        })}
        <div className='flex items-end space-x-2 md:col-start-3 lg:col-start-4 justify-end'>
          <Button type='submit' size='sm'>
            <Search className='mr-2 h-4 w-4' />
            查询
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleReset}
          >
            <RotateCcw className='mr-2 h-4 w-4' />
            重置
          </Button>
        </div>
      </form>
    </Form>
  )
}
