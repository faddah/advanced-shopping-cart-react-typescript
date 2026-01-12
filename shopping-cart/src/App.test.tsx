import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

// Helper function to render App with Router
const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  )
}

describe('App', () => {
  it('renders the heading "Shopping Cart Application"', () => {
    renderWithRouter()
    const heading = screen.getByRole('heading', { name: /shopping cart application/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the React logo image', () => {
    renderWithRouter()
    const reactLogo = screen.getByAltText(/react\.js logo graphic/i)
    expect(reactLogo).toBeInTheDocument()
    expect(reactLogo).toHaveClass('react-logo')
  })

  it('renders the shopping cart image', () => {
    renderWithRouter()
    const shoppingCartImage = screen.getByAltText(/shopping cart picture/i)
    expect(shoppingCartImage).toBeInTheDocument()
    expect(shoppingCartImage).toHaveClass('shopping-cart-image')
    expect(shoppingCartImage).toHaveAttribute('src', 'https://dijf55il5e0d1.cloudfront.net/images/na/1/7/3/17368_1000.jpg')
  })

  it('renders the main App container', () => {
    const { container } = renderWithRouter()
    const appDiv = container.querySelector('.App')
    expect(appDiv).toBeInTheDocument()
  })
})

// Store page tests - navigate to /store route
describe('Store Page', () => {
  it('renders the Store page when navigating to /store', () => {
    renderWithRouter('/store')
    const heading = screen.getByRole('heading', { name: /welcome to the store page/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the "Add to Cart" button on Store page', () => {
    renderWithRouter('/store')
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i })
    expect(addButtons.length).toBeGreaterThan(0)
  })
})
