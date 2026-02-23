// HTTP 클라이언트

import { API_BASE_URL } from '@/lib/utils/constants';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class HttpClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/c0341dfc-3427-4fbf-87e7-6341311978e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:28',message:'API request start',data:{url,method:config.method||'GET',baseURL:this.baseURL,endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    try {
      const response = await fetch(url, config);
      
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/c0341dfc-3427-4fbf-87e7-6341311978e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:40',message:'API response received',data:{status:response.status,statusText:response.statusText,ok:response.ok,url:response.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      if (!response.ok) {
        // 에러 응답 본문 읽기 시도
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails: any = null;

        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorDetails = await response.json();
            // FastAPI 에러 형식 처리
            if (errorDetails.detail) {
              errorMessage = Array.isArray(errorDetails.detail)
                ? errorDetails.detail.map((e: any) => e.msg || e).join(', ')
                : errorDetails.detail;
            } else if (errorDetails.message) {
              errorMessage = errorDetails.message;
            }
          } else {
            const text = await response.text();
            if (text) {
              errorMessage = text;
            }
          }
        } catch (parseError) {
          // 에러 본문 파싱 실패 시 기본 메시지 사용
          console.warn('Failed to parse error response:', parseError);
        }

        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/c0341dfc-3427-4fbf-87e7-6341311978e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:68',message:'API error response',data:{status:response.status,statusText:response.statusText,errorMessage,errorDetails},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
        // #endregion
        
        throw new ApiError(
          errorMessage,
          response.status,
          response.statusText,
          errorDetails
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return (await response.text()) as T;
    } catch (error) {
      // #region agent log
      const err = error instanceof Error ? error : new Error(String(error));
      fetch('http://127.0.0.1:7246/ingest/c0341dfc-3427-4fbf-87e7-6341311978e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:82',message:'API request exception',data:{errorType:err.constructor?.name,errorMessage:err.message,errorCause:err.cause!= null?String(err.cause):undefined,url,baseURL:this.baseURL},timestamp:Date.now(),runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
      // #endregion
      
      // ApiError는 그대로 전달
      if (error instanceof ApiError) {
        throw error;
      }
      
      // 네트워크 에러 등 기타 에러 처리
      console.error('API request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // 네트워크 연결 실패
        throw new ApiError(
          'Network error: Unable to connect to server. Please check your connection.',
          0,
          'Network Error'
        );
      }
      if (error instanceof Error) {
        throw new ApiError(
          error.message || 'Network error occurred',
          0,
          'Network Error'
        );
      }
      throw new ApiError(
        'An unexpected error occurred',
        0,
        'Unknown Error'
      );
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    const url = queryString ? `${endpoint}${queryString}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Content-Type을 자동으로 설정하도록 헤더 제거
    });
  }
}

export const apiClient = new HttpClient();

