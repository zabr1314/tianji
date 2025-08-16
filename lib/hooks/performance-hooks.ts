'use client'

import { useCallback, useRef, useEffect, useMemo, useState } from 'react'

// 防抖钩子
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return debouncedCallback
}

// 节流钩子
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0)
  
  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now
      callback(...args)
    }
  }, [callback, delay]) as T
  
  return throttledCallback
}

// 记忆化计算钩子
export function useMemoizedComputation<T>(
  computation: () => T,
  dependencies: any[]
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => computation(), dependencies)
}

// 延迟执行钩子
export function useDelay(callback: () => void, delay: number) {
  useEffect(() => {
    const timeout = setTimeout(callback, delay)
    return () => clearTimeout(timeout)
  }, [callback, delay])
}

// 交叉观察器钩子 - 用于懒加载
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    )
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options])
  
  return isIntersecting
}

// Web Worker 钩子
export function useWebWorker<T, R>(
  workerFunction: (data: T) => R,
  dependencies: any[] = []
) {
  const workerRef = useRef<Worker | undefined>(undefined)
  
  const runWorker = useCallback((data: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        const workerBlob = new Blob([`
          self.onmessage = function(e) {
            try {
              const result = (${workerFunction.toString()})(e.data);
              self.postMessage({ result });
            } catch (error) {
              self.postMessage({ error: error.message });
            }
          }
        `], { type: 'application/javascript' })
        
        workerRef.current = new Worker(URL.createObjectURL(workerBlob))
      }
      
      const handleMessage = (e: MessageEvent) => {
        if (e.data.error) {
          reject(new Error(e.data.error))
        } else {
          resolve(e.data.result)
        }
        workerRef.current?.removeEventListener('message', handleMessage)
      }
      
      workerRef.current.addEventListener('message', handleMessage)
      workerRef.current.postMessage(data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerFunction, ...dependencies])
  
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])
  
  return runWorker
}