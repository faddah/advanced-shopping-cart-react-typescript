import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the heading "Shopping Cart Application"', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { name: /shopping cart application/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the React logo image', () => {
    render(<App />)
    const reactLogo = screen.getByAltText(/react\.js logo graphic/i)
    expect(reactLogo).toBeInTheDocument()
    expect(reactLogo).toHaveClass('react-logo')
  })

  it('renders the shopping cart image', () => {
    render(<App />)
    const shoppingCartImage = screen.getByAltText(/shopping cart picture/i)
    expect(shoppingCartImage).toBeInTheDocument()
    expect(shoppingCartImage).toHaveClass('shopping-cart-image')
    expect(shoppingCartImage).toHaveAttribute('src', 'https://dijf55il5e0d1.cloudfront.net/images/na/1/7/3/17368_1000.jpg')
  })

  it('renders the main App container', () => {
    const { container } = render(<App />)
    const appDiv = container.querySelector('.App')
    expect(appDiv).toBeInTheDocument()
  })
})
