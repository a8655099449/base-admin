import request from '@/lib/request';

export interface UserInfo {
  id: string;
  username: string;
  realName: string;
  avatar?: string;
  applicationPermissionList?: Array<{
    appId: number;
    permissionList: string[];
  }>;
  lastVisitApplication?: {
    appId: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface LoginResponse {
  user: UserInfo;
  token: string;
}

export interface VerifyCodeResponse {
  content: {
    base64Image: string;
    uuid: string;
  };
}

export const loginApi = (data: unknown) =>
  request<LoginResponse>({
    url: '/auth/login',
    method: 'post',
    data,
    returnData: true,
  });

export const getUserInfo = () =>
  request<{ userInfo: UserInfo }>({
    url: '/auth/info',
    method: 'get',
    returnData: true,
  });


export const getMenus = (appId: number) =>
  request<{ list: Array<Record<string, unknown>>; content?: Array<Record<string, unknown>> }>({
    url: `/api/menus/build?applicationId=${appId}`,
    method: 'get',
    returnData: true,
  });

export const getSuperiorMenusApi = () =>
  request<{ list: Array<Record<string, unknown>>; content?: Array<Record<string, unknown>> }>({
    url: `/menus/superior`,
    method: 'get',
    returnData: true,
  });

export const logoutApi = () =>
  request({
    url: `/api/auth/logout`,
    method: 'DELETE',
  });

export const getVerifyCodeApi = () =>
  request<VerifyCodeResponse>({
    url: '/auth/getVerifyCode',
    method: 'post',
    returnData: true,
  });
