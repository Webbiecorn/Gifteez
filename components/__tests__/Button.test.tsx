import React from 'react'
import { screen, fireEvent } from '@testing-library/dom'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Button from '../Button'

describe('Button', () => {
  describe('Basic Rendering', () => {
    it('should render children content', () => {
      render(<Button>Click me</Button>)
      
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should render as a button element', () => {
      const { container } = render(<Button>Click me</Button>)
      
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('should accept and render React nodes as children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      )
      
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should apply primary variant styles by default', () => {
      const { container } = render(<Button>Primary</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-gradient-to-r', 'from-primary', 'to-accent')
    })

    it('should apply primary variant styles explicitly', () => {
      const { container } = render(<Button variant="primary">Primary</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-gradient-to-r', 'from-primary', 'to-accent', 'text-white')
    })

    it('should apply accent variant styles', () => {
      const { container } = render(<Button variant="accent">Accent</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-accent', 'text-white', 'hover:bg-accent-hover')
    })

    it('should apply secondary variant styles', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-white', 'text-purple-700', 'border', 'border-accent/40')
    })

    it('should apply ghost variant styles', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('bg-transparent', 'text-white', 'border', 'border-white/40')
    })

    it('should apply all base classes to all variants', () => {
      const variants: Array<'primary' | 'accent' | 'secondary' | 'ghost'> = ['primary', 'accent', 'secondary', 'ghost']
      
      variants.forEach((variant) => {
        const { container } = render(<Button variant={variant}>{variant}</Button>)
        const button = container.querySelector('button')
        
        expect(button).toHaveClass('font-display', 'font-bold', 'py-3', 'px-6', 'rounded-lg')
        expect(button).toHaveClass('shadow-md', 'transition-all', 'duration-200')
        expect(button).toHaveClass('transform', 'hover:scale-105', 'hover:shadow-xl')
        expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2')
      })
    })
  })

  describe('Custom Styling', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<Button className="custom-class">Custom</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should preserve base and variant classes when applying custom className', () => {
      const { container } = render(
        <Button variant="accent" className="custom-class">
          Custom
        </Button>
      )
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('bg-accent')
      expect(button).toHaveClass('font-display')
    })

    it('should handle empty className prop', () => {
      const { container } = render(<Button className="">Empty</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('font-display')
    })

    it('should allow className to override styles', () => {
      const { container } = render(<Button className="!bg-red-500">Override</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('!bg-red-500')
    })
  })

  describe('HTML Button Attributes', () => {
    it('should forward type attribute', () => {
      const { container } = render(<Button type="submit">Submit</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should forward disabled attribute', () => {
      const { container } = render(<Button disabled>Disabled</Button>)
      
      const button = container.querySelector('button')
      expect(button).toBeDisabled()
    })

    it('should forward aria attributes', () => {
      const { container } = render(
        <Button aria-label="Close dialog" aria-pressed="true">
          Close
        </Button>
      )
      
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('aria-label', 'Close dialog')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    it('should forward data attributes', () => {
      const { container } = render(
        <Button data-testid="custom-button" data-track="click">
          Track
        </Button>
      )
      
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('data-testid', 'custom-button')
      expect(button).toHaveAttribute('data-track', 'click')
    })

    it('should forward id attribute', () => {
      const { container } = render(<Button id="submit-btn">Submit</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('id', 'submit-btn')
    })

    it('should forward name attribute', () => {
      const { container } = render(<Button name="action">Action</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('name', 'action')
    })

    it('should forward value attribute', () => {
      const { container } = render(<Button value="submit-value">Submit</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveAttribute('value', 'submit-value')
    })
  })

  describe('Event Handling', () => {
    it('should handle onClick events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByText('Click me')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should pass event object to onClick handler', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByText('Click me')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object))
      expect(handleClick.mock.calls[0][0]).toHaveProperty('target')
    })

    it('should not trigger onClick when disabled', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Disabled</Button>)
      
      const button = screen.getByText('Disabled')
      fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should support multiple onClick handlers via event bubbling', () => {
      const handleClick1 = vi.fn()
      const handleClick2 = vi.fn()
      
      render(
        <div onClick={handleClick2}>
          <Button onClick={handleClick1}>Click me</Button>
        </div>
      )
      
      const button = screen.getByText('Click me')
      fireEvent.click(button)
      
      expect(handleClick1).toHaveBeenCalledTimes(1)
      expect(handleClick2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>Keyboard</Button>)
      
      const button = screen.getByText('Keyboard')
      button.focus()
      
      expect(document.activeElement).toBe(button)
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should trigger on Space key press', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>Space</Button>)
      
      const button = screen.getByText('Space')
      button.focus()
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should have focus ring styles', () => {
      const { container } = render(<Button>Focus</Button>)
      
      const button = container.querySelector('button')
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2')
    })

    it('should have appropriate focus ring color for each variant', () => {
      const { container: primaryContainer } = render(<Button variant="primary">Primary</Button>)
      expect(primaryContainer.querySelector('button')).toHaveClass('focus:ring-accent')
      
      const { container: accentContainer } = render(<Button variant="accent">Accent</Button>)
      expect(accentContainer.querySelector('button')).toHaveClass('focus:ring-accent')
      
      const { container: secondaryContainer } = render(<Button variant="secondary">Secondary</Button>)
      expect(secondaryContainer.querySelector('button')).toHaveClass('focus:ring-accent/40')
      
      const { container: ghostContainer } = render(<Button variant="ghost">Ghost</Button>)
      expect(ghostContainer.querySelector('button')).toHaveClass('focus:ring-white/40')
    })

    it('should support screen reader text', () => {
      render(
        <Button>
          <span className="sr-only">Close dialog</span>
          <span aria-hidden="true">×</span>
        </Button>
      )
      
      expect(screen.getByText('Close dialog')).toBeInTheDocument()
      expect(screen.getByText('×')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long text content', () => {
      const longText = 'This is a very long button text that might cause layout issues if not handled properly'
      render(<Button>{longText}</Button>)
      
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should handle empty children gracefully', () => {
      const { container } = render(<Button>{''}</Button>)
      
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      expect(button?.textContent).toBe('')
    })

    it('should handle numeric children', () => {
      render(<Button>{42}</Button>)
      
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should handle boolean children', () => {
      render(<Button>{true}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle null children', () => {
      render(<Button>{null}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle undefined children', () => {
      render(<Button>{undefined}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle rapid consecutive clicks', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Rapid</Button>)
      
      const button = screen.getByText('Rapid')
      
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button)
      }
      
      expect(handleClick).toHaveBeenCalledTimes(10)
    })

    it('should maintain state across re-renders', () => {
      const { rerender } = render(<Button>Original</Button>)
      
      expect(screen.getByText('Original')).toBeInTheDocument()
      
      rerender(<Button>Updated</Button>)
      
      expect(screen.queryByText('Original')).not.toBeInTheDocument()
      expect(screen.getByText('Updated')).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('should work in form submission context', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      )
      
      const button = screen.getByText('Submit Form')
      fireEvent.click(button)
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should work with form reset', () => {
      render(
        <form>
          <Button type="reset">Reset Form</Button>
        </form>
      )
      
      const button = screen.getByText('Reset Form')
      expect(button).toHaveAttribute('type', 'reset')
    })

    it('should work as regular button in form', () => {
      const handleClick = vi.fn()
      
      render(
        <form>
          <Button type="button" onClick={handleClick}>
            Regular Button
          </Button>
        </form>
      )
      
      const button = screen.getByText('Regular Button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should render correctly in lists', () => {
      render(
        <ul>
          <li><Button>Item 1</Button></li>
          <li><Button>Item 2</Button></li>
          <li><Button>Item 3</Button></li>
        </ul>
      )
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should work with different variants side by side', () => {
      render(
        <div>
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      )
      
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByText('Accent')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
      expect(screen.getByText('Ghost')).toBeInTheDocument()
    })
  })
})
