import * as LucideIcons from 'lucide-react'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth-store'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { menus, user } = useAuthStore()

  // 映射 Lucide 图标
  const mapIcon = (iconName?: string) => {
    if (!iconName) return LucideIcons.LayoutDashboard
    const Icon = (LucideIcons as Record<string, unknown>)[iconName]
    return (Icon as LucideIcons.LucideIcon) || LucideIcons.LayoutDashboard
  }

  const displayUser = {
    name: user?.realName || user?.username || 'Admin',
    email: String(user?.email || ''),
    avatar: user?.avatar || '/avatars/shadcn.jpg',
  }

  // 将动态菜单转换为 NavGroup 格式
  const dynamicNavGroups = [
    {
      title: 'Menu',
      items: menus.map((menu) => ({
        title: menu.name,
        url: menu.path,
        icon: mapIcon(menu.icon),
        items: menu.children?.map((child) => ({
          title: child.name,
          url: child.path,
          icon: mapIcon(child.icon),
        })),
      })),
    },
  ]

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {dynamicNavGroups.map((props) => (
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          <NavGroup key={props.title} {...(props as any)} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
