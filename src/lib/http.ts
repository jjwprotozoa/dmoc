// src/lib/http.ts
// HTTP client factory with axios, retry logic, and AbortSignal support
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface HttpClientConfig extends AxiosRequestConfig {
  retries?: number;
  retryDelay?: number;
}

/**
 * Creates an HTTP client with base configuration, interceptors, and retry logic
 * @param baseURL - Base URL for the client
 * @param config - Additional axios configuration
 * @returns Configured axios instance
 */
export function http(baseURL: string, config: HttpClientConfig = {}): AxiosInstance {
  const { retries = 2, retryDelay = 1000, ...axiosConfig } = config;
  
  const client = axios.create({
    baseURL,
    timeout: 30000,
    ...axiosConfig,
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    (config) => {
      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor with retry logic for 5xx errors
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      
      // Only retry on 5xx errors and if retries are configured
      if (response?.status >= 500 && config.retryCount < retries) {
        config.retryCount = (config.retryCount || 0) + 1;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * config.retryCount));
        
        // Retry the request
        return client(config);
      }
      
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Creates an HTTP client with AbortSignal support
 * @param baseURL - Base URL for the client
 * @param config - Additional axios configuration
 * @returns Configured axios instance with abort support
 */
export function httpWithAbort(baseURL: string, config: HttpClientConfig = {}): AxiosInstance {
  const client = http(baseURL, config);
  
  // Add abort signal support
  client.interceptors.request.use(
    (config) => {
      if (!config.signal) {
        config.signal = AbortSignal.timeout(config.timeout || 30000);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  return client;
}

export type { AxiosInstance, AxiosRequestConfig, AxiosResponse };
