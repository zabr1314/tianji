'use client'

import Image from 'next/image'
import { useState, memo } from 'react'
import { Loader2 } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

// 优化的图片组件，支持懒加载和加载状态
export const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 80,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div className={`${className} bg-slate-100 dark:bg-slate-800 flex items-center justify-center`}>
        <div className="text-center text-slate-400">
          <div className="text-xs font-serif">图片加载失败</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-10">
          <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
        </div>
      )}
      
      {/* Next.js 优化图片 */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

// 头像组件优化版
interface OptimizedAvatarProps {
  src?: string
  fallbackText: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const OptimizedAvatar = memo(({
  src,
  fallbackText,
  size = 'md',
  className = ''
}: OptimizedAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (!src || imageError) {
    return (
      <div className={`${sizeClasses[size]} bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full flex items-center justify-center font-serif font-bold ${className}`}>
        {fallbackText.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
          <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
        </div>
      )}
      <OptimizedImage
        src={src}
        alt={`${fallbackText}的头像`}
        fill
        className="rounded-full object-cover"
        quality={60}
        sizes="(max-width: 64px) 64px, 64px"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  )
})

OptimizedAvatar.displayName = 'OptimizedAvatar'

// 背景图片组件优化版
interface OptimizedBackgroundProps {
  src: string
  alt: string
  children: React.ReactNode
  className?: string
  overlay?: boolean
  overlayOpacity?: number
}

export const OptimizedBackground = memo(({
  src,
  alt,
  children,
  className = '',
  overlay = false,
  overlayOpacity = 0.3
}: OptimizedBackgroundProps) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover -z-10"
        priority
        quality={70}
        sizes="100vw"
      />
      {overlay && (
        <div 
          className="absolute inset-0 bg-black -z-5"
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
})

OptimizedBackground.displayName = 'OptimizedBackground'