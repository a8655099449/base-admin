import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { getUserInfo, getMenus, getSuperiorMenusApi, type UserInfo } from '@/api/auth'
import storage from '@/lib/storage'

const ACCESS_TOKEN = 'token'

interface NavItem {
  name: string
  path: string
  icon?: string
  children?: NavItem[]
  hideInMenu?: boolean
  meta?: Record<string, unknown>
  type?: number
}

interface AuthState {
  user: UserInfo | null
  accessToken: string | null | undefined
  menus: NavItem[]
  loading: boolean
  
  setUser: (user: UserInfo | null) => void
  setAccessToken: (token: string) => void
  setMenus: (menus: NavItem[]) => void
  
  login: (token: string, user: UserInfo) => Promise<void>
  init: () => Promise<void>
  reset: () => void
}

const transformRoute = (children: Array<Record<string, unknown>>): NavItem[] => {
  const res = (children || []).map((item) => {
    const target: Record<string, unknown> = { ...item }
    
    if (
      Array.isArray(target.children) &&
      target.children.length === 1 &&
      !target.name &&
      target.children.filter((c: Record<string, unknown>) => c.component).length === 1
    ) {
      const firstChild = target.children[0] as Record<string, unknown>
      Object.assign(target, firstChild)
      target.children = []
    }
    
    const meta = (target.meta as Record<string, unknown>) || {}
    target.icon = (meta.icon as string) || (target.icon as string)
    target.path = String(target.path || '').replace('//', '/')
    target.hideInMenu = Boolean(target.hidden)
    target.name = String(target.name || target.title || '')

    if (Array.isArray(target.children) && target.children.length > 0) {
      target.children = transformRoute(target.children as Array<Record<string, unknown>>)
    }

    return target as unknown as NavItem
  })

  return res.filter(
    (item) => !item.hideInMenu && (item.type === undefined || item.type === 1)
  )
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initToken = getCookie(ACCESS_TOKEN) || storage.get<string | undefined>('token', undefined)

  return {
    user: storage.get<UserInfo | null>('user_info', null),
    accessToken: initToken,
    menus: storage.get<NavItem[]>('menus', []),
    loading: false,

    setUser: (user) => {
      storage.set('user_info', user)
      set({ user })
    },
    
    setAccessToken: (token) => {
      setCookie(ACCESS_TOKEN, token)
      storage.set('token', token)
      set({ accessToken: token })
    },

    setMenus: (menus) => {
      storage.set('menus', menus)
      set({ menus })
    },

    login: async (token, user) => {
      const { setAccessToken, setUser, init } = get()
      setAccessToken(token)
      setUser(user)
      await init()
    },

    init: async () => {
      const { accessToken, setMenus, setUser } = get()
      if (!accessToken) return

      set({ loading: true })
      try {
        const userRes = await getUserInfo()
        if (userRes && userRes.userInfo) {
          const userInfo = userRes.userInfo
          setUser(userInfo)
          
          const isRoot = userInfo.username === 'root'
          const menuRes = await (isRoot ? getSuperiorMenusApi() : getMenus(1))
          
          const menuList = menuRes.list || menuRes.content || []
          setMenus(transformRoute(menuList))
        }
      } catch (_error) {
        // Silent
      } finally {
        set({ loading: false })
      }
    },

    reset: () => {
      removeCookie(ACCESS_TOKEN)
      storage.remove('token')
      storage.remove('user_info')
      storage.remove('menus')
      set({ user: null, accessToken: undefined, menus: [] })
    }
  }
})
