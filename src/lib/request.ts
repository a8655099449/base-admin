import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { decodeAES, encodeAES } from './encrypt';
import storage from './storage';

const baseURL = import.meta.env.VITE_BASE_URL || '/api';

export type RequestProps = AxiosRequestConfig & {
  returnData?: boolean;
  notReject?: boolean;
  hideErrorMessage?: boolean;
  errorMessage?: string;
  isEncrypted?: boolean;
};

const instance = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Channer-Type': '0',
  },
});

// 请求拦截
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string | undefined>('token', undefined);
    if (token && config.headers) {
      config.headers.Authorization = token;
    }

    // 处理加密
    const customConfig = config as InternalAxiosRequestConfig & RequestProps;
    if (customConfig.isEncrypted && config.method?.toLowerCase() !== 'get' && config.data) {
      config.data = { encrypted: encodeAES(JSON.stringify(config.data)) };
    } else if(config.data){
      // config.data = {
      //   encrypted:config.data
      // }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const customConfig = response.config as AxiosRequestConfig & RequestProps;
    let data = response.data;

    // 处理解密
    if (customConfig.isEncrypted && typeof data === 'string') {
      try {
        const decoded = decodeAES(data);
        data = JSON.parse(decoded);
      } catch (_e) {
        // Silent
      }
    }

    const { status, msg, data: resultData } = data;

    // 401 处理
    if (status === '401 UNAUTHORIZED' || data.code === 401) {
      storage.remove('token');
      window.location.href = '/sign-in';
      return Promise.reject(data);
    }

    // 业务逻辑成功判断 (假设 0 为成功)
    if (status !== undefined && Number(status) !== 0 && !customConfig.notReject) {
      if (!customConfig.hideErrorMessage) {
        toast.error(msg || customConfig.errorMessage || '服务繁忙');
      }
      return Promise.reject(data);
    }

    return customConfig.returnData ? resultData : data;
  },
  (error) => {
    const customConfig = error.config as AxiosRequestConfig & RequestProps;
    if (error.response?.status === 401) {
      storage.remove('token');
      window.location.href = '/sign-in';
    } else if (!customConfig?.hideErrorMessage) {
      toast.error(error.response?.data?.message || error.message || '服务繁忙');
    }
    return Promise.reject(error);
  }
);

async function request<T = unknown>(config: RequestProps): Promise<T> {
  return instance.request(config);
}

export default request;
