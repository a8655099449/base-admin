import * as React from 'react'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type ProColumnDef } from './types'
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogFooter as ShadcnDialogFooter,
} from '@/components/ui/dialog'

interface ActionDialogProps<TData> {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (values: TData) => Promise<void>
  initialValues?: TData
  columns: ProColumnDef<TData, unknown>[]
}

export function ActionDialog<TData>({
  title,
  open,
  onOpenChange,
  onConfirm,
  initialValues,
  columns,
}: ActionDialogProps<TData>) {
  const formFields = columns.filter((col) => !col.meta?.hideInForm && (col as { accessorKey?: string }).accessorKey)
  
  const form = useForm<Record<string, unknown>>({
    values: (initialValues as unknown as Record<string, unknown>) || {},
  })

  const [loading, setLoading] = React.useState(false)

  const handleSubmit = React.useCallback(async (values: Record<string, unknown>) => {
    setLoading(true)
    try {
      await onConfirm(values as TData)
      onOpenChange(false)
      form.reset()
    } finally {
      setLoading(false)
    }
  }, [onConfirm, onOpenChange, form])

  return (
    <ShadcnDialog open={open} onOpenChange={onOpenChange}>
      <ShadcnDialogContent className='sm:max-w-[500px]'>
        <ShadcnDialogHeader>
          <ShadcnDialogTitle>{title}</ShadcnDialogTitle>
        </ShadcnDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            {formFields.map((col) => {
              const id = (col as { accessorKey: string }).accessorKey
              const label = col.title || (col.header as string) || id
              const valueType = col.meta?.valueType || 'text'

              return (
                <FormField
                  key={id}
                  control={form.control}
                  name={id}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        {valueType === 'select' ? (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value as string}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`请选择${label}`} />
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
                          <Input placeholder={`请输入${label}`} {...field} value={(field.value as string) ?? ''} />
                        )}
                      </FormControl>
                    </FormItem>
                  )}
                />
              )
            })}
            <ShadcnDialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type='submit' disabled={loading}>
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                确认
              </Button>
            </ShadcnDialogFooter>
          </form>
        </Form>
      </ShadcnDialogContent>
    </ShadcnDialog>
  )
}
