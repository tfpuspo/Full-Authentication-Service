import { HTMLAttributes } from 'react'
import { cn } from '@/utils/helpers'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }

export default function Card({ padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', paddingStyles[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}
