import request from '@/lib/request';

export interface MenuItem {
  id: number;
  pid: number | string;
  title: string;
  type: number; // 1: Menu/Directory, 2: Button
  icon?: string;
  path?: string;
  permission?: string;
  menuSort: number;
  hidden: boolean;
  children?: MenuItem[];
  subCount?: number;
  [key: string]: unknown;
}

export interface MenuParams {
  title?: string;
  type?: number;
  hidden?: boolean;
  menuSort?: number;
  pid?: number | string;
  path?: string;
  icon?: string;
  permission?: string;
  applicationId?: number;
}

export const getSuperiorMenusApi = () =>
  request<{ content: MenuItem[] }>({
    url: '/api/menus/superior',
    method: 'get',
    returnData: true,
  });

export const createMenuApi = (data: MenuParams) =>
  request({
    url: '/api/menus/createMenu',
    method: 'post',
    data: {
      ...data,
      applicationId: 1, // Fixed appId 1
    },
    returnData: true,
  });

export const updateMenuApi = (data: Partial<MenuItem>) =>
  request({
    url: '/api/menus/updateMenu',
    method: 'put',
    data,
    returnData: true,
  });

export const deleteMenuApi = (ids: number[]) =>
  request({
    url: '/api/menus/deleteMenu',
    method: 'post',
    data: ids,
    returnData: true,
  });
