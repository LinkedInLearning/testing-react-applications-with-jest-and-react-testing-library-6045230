import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Component', () => {
  it('renders the heading', () => {
    render(<App />)
    
    // Check if the heading exists
    const heading = screen.getByText(/Welcome To Blog App/i)
    expect(heading).toBeInTheDocument()
  })

  it('renders the "Create a post" button', () => {
    render(<App />)
    
    // Check if the button exists
    const button = screen.getByText(/Create a post/i)
    expect(button).toBeInTheDocument()
  })

  it('allows clicking the "Create a post" button', async () => {
    render(<App />)

    // Simulate user clicking the button
    const button = screen.getByText(/Create a post/i)
    await button.click()

    // No assertion needed—just verifying that clicking does not throw an error
  })
})
