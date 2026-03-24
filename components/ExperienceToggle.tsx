'use client'
import type { ExperienceLevel } from '@/lib/types'

const LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

interface Props {
  value: ExperienceLevel
  onChange: (level: ExperienceLevel) => void
}

export function ExperienceToggle({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {LEVELS.map(level => (
        <button
          key={level.value}
          onClick={() => onChange(level.value)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value === level.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {level.label}
        </button>
      ))}
    </div>
  )
}
