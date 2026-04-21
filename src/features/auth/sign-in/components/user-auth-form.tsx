import { useEffect, useState, type HTMLAttributes } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { rsaEncrypt } from '@/lib/encrypt'
import { loginApi, getVerifyCodeApi, type VerifyCodeResponse } from '@/api/auth'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  username: z.string().min(1, 'Please enter your username'),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(6, 'Password must be at least 6 characters long'),
  code: z.string().min(1, 'Please enter the captcha'),
})

interface UserAuthFormProps extends HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [captchaData, setCaptchaData] = useState<VerifyCodeResponse['content'] | null>(null)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      code: '',
    },
  })

  const fetchCaptcha = async () => {
    try {
      const res = await getVerifyCodeApi()
      if (res) {

        // According to legacy code, it might be in content or direct
        // Let's assume the response wrapper handled it or it matches the interface
        setCaptchaData(res.content)
      }
    } catch (_error) {
      // Error handled by interceptor
    }
  }

  useEffect(() => {
    fetchCaptcha()
  }, [])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const payload = {
        username: data.username,
        password: rsaEncrypt(data.password),
        uuid: captchaData?.uuid,
        channel: 0,
        code:'',
        captcha:data.code
      }

      const res = await loginApi(payload)

      if (res && res.token) {
        // Set user and access token and initialize menus
        await useAuthStore.getState().login(res.token, res.user)

        toast.success(`Welcome back, ${res.user.realName || res.user.username}!`)

        // Redirect to the stored location or default to dashboard
        const targetPath = redirectTo || '/'
        navigate({ to: targetPath, replace: true })
      }
    } catch (_error: unknown) {
      // Error is handled by request interceptor (toast)
      fetchCaptcha() // Refresh captcha on error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder='admin' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Captcha</FormLabel>
              <div className='flex gap-2'>
                <FormControl className='flex-1'>
                  <Input placeholder='Enter code' {...field} />
                </FormControl>
                {captchaData && (
                  <div 
                    className='h-10 w-28 cursor-pointer overflow-hidden rounded-md border bg-muted'
                    onClick={fetchCaptcha}
                    title='Click to refresh'
                  >
                    <img 
                      src={`data:image/png;base64,${captchaData.base64Image}`} 
                      alt='captcha'
                      className='h-full w-full object-cover'
                    />
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
