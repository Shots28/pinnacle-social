import { cn } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { StatusColor } from '@/lib/types/app'

const ringColorMap: Record<StatusColor, string> = {
  green: 'ring-green-500',
  yellow: 'ring-yellow-500',
  red: 'ring-red-500',
  blue: 'ring-blue-500',
}

const sizeMap = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-14',
} as const

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
} as const

interface PersonAvatarProps {
  firstName: string
  lastName?: string | null
  avatarUrl?: string | null
  statusColor: StatusColor
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PersonAvatar({
  firstName,
  lastName,
  avatarUrl,
  statusColor,
  size = 'md',
  className,
}: PersonAvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background',
        ringColorMap[statusColor],
        sizeMap[size],
        className
      )}
    >
      <Avatar
        className={cn('!size-full')}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
      >
        {avatarUrl && <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName ?? ''}`} />}
        <AvatarFallback className={cn(textSizeMap[size])}>
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
