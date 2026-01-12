import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
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

  // Helper function to test adding an item to cart
  const testAddToCart = async (itemName: string) => {
    const user = userEvent.setup()
    renderWithRouter('/store')
    
    // Find the item and its button
    const itemHeading = screen.getByText(itemName)
    expect(itemHeading).toBeInTheDocument()
    
    // Find the "+ Add To Cart" button for the item
    const itemCard = itemHeading.closest('.card')
    expect(itemCard).not.toBeNull()
    const addButton = itemCard!.querySelector('button')
    expect(addButton).not.toBeNull()
    expect(addButton).toHaveTextContent(/add to cart/i)
    
    // Click the button
    await user.click(addButton!)
    
    // Verify the button text changed to show quantity controls
    const quantityTexts = screen.getAllByText(/in cart/)
    expect(quantityTexts.length).toBeGreaterThan(0)
    // Verify we see a "-" and "+" button
    const allButtons = screen.getAllByRole('button')
    const minusButtons = allButtons.filter(btn => btn.textContent === '-')
    const plusButtons = allButtons.filter(btn => btn.textContent === '+')
    expect(minusButtons.length).toBeGreaterThan(0)
    expect(plusButtons.length).toBeGreaterThan(0)
  }

  it('adds Book to cart when clicking its "+ Add To Cart" button', async () => {
    await testAddToCart('Book')
  })

  it('adds Computer to cart when clicking its "+ Add To Cart" button', async () => {
    await testAddToCart('Computer')
  })

  it('adds Banana to cart when clicking its "+ Add To Cart" button', async () => {
    await testAddToCart('Banana')
  })

  it('adds Car to cart when clicking its "+ Add To Cart" button', async () => {
    await testAddToCart('Car')
  })
})

// TODO Please write me more tests for the Store page that tests each "+ Add to Cart" buttons 
/* functionality and cart item updates, and also tests the "+" and "-" buttons in the cart
to see that they increment and decrement the cart item quantities correctly. Please also
test the "Remove" button to see that it removes the item(s) from the cart. */



// TODO: Add more tests for other routes, components, and interactions as needed
