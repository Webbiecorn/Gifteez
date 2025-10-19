/**
 * Base API Client with retry logic, timeouts, and rate limiting
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Request timeout handling
 * - Rate limiting per endpoint
 * - Error logging and tracking
 * - Request/response interceptors
 */

import { logger } from './logger'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number // milliseconds
  retries?: number
  retryDelay?: number // milliseconds
  rateLimitKey?: string // For rate limiting per endpoint
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

class ApiClient {
  private baseURL: string
  private defaultTimeout: number = 10000 // 10 seconds
  private defaultRetries: number = 3
  private defaultRetryDelay: number = 1000 // 1 second
  private rateLimits: Map<string, RateLimitEntry> = new Map()
  private requestsPerMinute: number = 60 // Default rate limit

  constructor(baseURL: string, requestsPerMinute?: number) {
    this.baseURL = baseURL
    if (requestsPerMinute) {
      this.requestsPerMinute = requestsPerMinute
    }
  }

  /**
   * Check if request is within rate limit
   */
  private checkRateLimit(key: string): boolean {
    const now = Date.now()
    const entry = this.rateLimits.get(key)

    if (!entry || now > entry.resetAt) {
      // Reset rate limit window
      this.rateLimits.set(key, {
        count: 1,
        resetAt: now + 60000, // 1 minute window
      })
      return true
    }

    if (entry.count >= this.requestsPerMinute) {
      logger.warn('Rate limit exceeded', { key, count: entry.count })
      return false
    }

    entry.count++
    return true
  }

  /**
   * Sleep for exponential backoff
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Make HTTP request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`)
      }
      throw error
    }
  }

  /**
   * Main request method with retry logic
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      rateLimitKey = endpoint,
    } = options

    // Check rate limit
    if (!this.checkRateLimit(rateLimitKey)) {
      throw new Error(`Rate limit exceeded for ${rateLimitKey}`)
    }

    const url = `${this.baseURL}${endpoint}`
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    if (body) {
      requestOptions.body = JSON.stringify(body)
    }

    let lastError: Error | null = null

    // Retry loop
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        logger.info('API request', {
          url,
          method,
          attempt: attempt + 1,
          maxAttempts: retries + 1,
        })

        const response = await this.fetchWithTimeout(url, requestOptions, timeout)

        // Handle HTTP errors
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
        }

        // Parse response
        const data = await response.json()

        logger.info('API request successful', {
          url,
          method,
          status: response.status,
          attempt: attempt + 1,
        })

        return data as T
      } catch (error) {
        lastError = error as Error

        logger.warn('API request failed', {
          url,
          method,
          attempt: attempt + 1,
          maxAttempts: retries + 1,
          error: lastError.message,
        })

        // Don't retry on last attempt
        if (attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s, etc.
          const delay = retryDelay * Math.pow(2, attempt)
          logger.info('Retrying request', { delay, nextAttempt: attempt + 2 })
          await this.sleep(delay)
        }
      }
    }

    // All retries failed
    logger.error('API request failed after all retries', {
      url,
      method,
      attempts: retries + 1,
      error: lastError?.message,
    })

    throw lastError || new Error('Request failed after all retries')
  }

  /**
   * Convenience methods
   */
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Clear rate limits (for testing or manual reset)
   */
  clearRateLimits(): void {
    this.rateLimits.clear()
  }
}

export default ApiClient
