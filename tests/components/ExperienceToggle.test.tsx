import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExperienceToggle } from '@/components/ExperienceToggle'

describe('ExperienceToggle', () => {
  it('renders all three levels', () => {
    render(<ExperienceToggle value="beginner" onChange={() => {}} />)
    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Intermediate')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('calls onChange with the selected level', () => {
    const onChange = vi.fn()
    render(<ExperienceToggle value="beginner" onChange={onChange} />)
    fireEvent.click(screen.getByText('Intermediate'))
    expect(onChange).toHaveBeenCalledWith('intermediate')
  })

  it('highlights the active level', () => {
    render(<ExperienceToggle value="intermediate" onChange={() => {}} />)
    const button = screen.getByText('Intermediate')
    expect(button.className).toMatch(/bg-/)
  })
})
