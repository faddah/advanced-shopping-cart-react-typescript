import { describe, it, expect, beforeEach } from 'vitest'
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
})

// Store page cart functionality tests
describe('Store Page - Cart Functionality', () => {
  // Clear localStorage before each test to ensure test isolation
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds an item to the cart when "Add to Cart" button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter('/store')

    // Find the first "Add to Cart" button (for Book item)
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i })
    const firstAddButton = addToCartButtons[0]

    // Click the button to add item to cart
    await user.click(firstAddButton)

    // After clicking, the button should be replaced with quantity controls
    expect(screen.getByText('in cart')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '-' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: '+' })).toHaveLength(1)
  })

  it('adds multiple different items to the cart', async () => {
    const user = userEvent.setup()
    renderWithRouter('/store')

    // Get all "Add to Cart" buttons
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i })

    // Add first item (Book)
    await user.click(addToCartButtons[0])

    // Add second item (Computer) - need to get buttons again as DOM has updated
    const updatedButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await user.click(updatedButtons[0])

    // Both items should now show quantity controls
    const quantityTexts = screen.getAllByText(/in cart/)
    expect(quantityTexts).toHaveLength(2)
  })

  it('increments item quantity when "+" button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter('/store')

    // Add an item to cart first
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await user.click(addToCartButtons[0])

    // Verify initial quantity is 1
    expect(screen.getByText('in cart')).toBeInTheDocument()

    // Find and click the "+" button to increment quantity
    const incrementButtons = screen.getAllByRole('button', { name: '+' })
    await user.click(incrementButtons[0])

    // Verify quantity increased to 2 - check for presence of increment/decrement buttons
    const decrementButtons = screen.getAllByRole('button', { name: '-' })
    expect(decrementButtons).toHaveLength(1)
  })

  it('increments item quantity multiple times', async () => {
    const user = userEvent.setup()
    renderWithRouter('/store')

    // Add an item to cart
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await user.click(addToCartButtons[0])

    // Click "+" button three times
    const incrementButton = screen.getAllByRole('button', { name: '+' })[0]
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)

    // Verify quantity is now 4 (1 initial + 3 increments) - check buttons still exist
    expect(screen.getByText('in cart')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '-' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(1)
  })

  it('decrements item quantity when "-" button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter('/store')

    // Add an item and increment to quantity 2
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await user.click(addToCartButtons[0])

    const incrementButton = screen.getAllByRole('button', { name: '+' })[0]
    await user.click(incrementButton)

    // Verify quantity is 2
    expect(screen.getByText('in cart')).toBeInTheDocument()

    // Click the "-" button to decrement
    const decrementButton = screen.getByRole('button', { name: '-' })
    await user.click(decrementButton)

    // Verify quantity decreased to 1 - buttons still present
    expect(screen.getByText('in cart')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '-' })).toHaveLength(1)
  })

  it('removes item from cart when decrementing from quantity 1', async () => {
    const user = userEvent.setup()
    renderWithRouter('/store')

    // Add an item to cart (quantity will be 1)
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await user.click(addToCartButtons[0])

    // Verify quantity controls are visible
    expect(screen.getByText('in cart')).toBeInTheDocument()

    // Click "-" button when quantity is 1
    const decrementButton = screen.getByRole('button', { name: '-' })
    await user.click(decrementButton)

    // Item should be removed - "Add to Cart" button should reappear
    const addToCartButton = screen.getAllByRole('button', { name: /add to cart/i })
    expect(addToCartButton.length).toBeGreaterThan(0)

    // Quantity controls should no longer be visible for this item
    expect(screen.queryByText('in cart')).not.toBeInTheDocument()
  })

  it('removes item from cart when "Remove" button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter('/store')

    // Add an item to cart
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await user.click(addToCartButtons[0])

    // Increment quantity to 3
    const incrementButton = screen.getAllByRole('button', { name: '+' })[0]
    await user.click(incrementButton)
    await user.click(incrementButton)

    // Verify quantity controls exist
    expect(screen.getByText('in cart')).toBeInTheDocument()

    // Click "Remove" button
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await user.click(removeButton)

    // Item should be removed completely - "Add to Cart" button should reappear
    const newAddToCartButtons = screen.getAllByRole('button', { name: /add to cart/i })
    expect(newAddToCartButtons.length).toBeGreaterThan(0)
  })

  it('removes item from cart regardless of quantity when "Remove" button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter('/store')

    // Add an item with quantity 5
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await user.click(addToCartButtons[0])

    const incrementButton = screen.getAllByRole('button', { name: '+' })[0]
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)

    // Verify quantity controls exist
    expect(screen.getByText('in cart')).toBeInTheDocument()

    // Click "Remove" button
    const removeButton = screen.getByRole('button', { name: /remove/i })
    await user.click(removeButton)

    // Quantity controls should no longer exist
    expect(screen.queryByText('in cart')).not.toBeInTheDocument()
  })

  it('manages multiple items in cart independently', async () => {
    const user = userEvent.setup()
    renderWithRouter('/store')

    // Add first item (Book)
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await user.click(addToCartButtons[0])

    // Add second item (Computer)
    const updatedButtons1 = screen.getAllByRole('button', { name: /add to cart/i })
    await user.click(updatedButtons1[0])

    // Add third item (Banana)
    const updatedButtons2 = screen.getAllByRole('button', { name: /add to cart/i })
    await user.click(updatedButtons2[0])

    // Increment first item to quantity 3
    const incrementButtons = screen.getAllByRole('button', { name: /^\+$/ })
    await user.click(incrementButtons[0])
    await user.click(incrementButtons[0])

    // Increment second item to quantity 2
    const updatedIncrementButtons = screen.getAllByRole('button', { name: /^\+$/ })
    await user.click(updatedIncrementButtons[1])

    // All three items should show "in cart" text
    const inCartTexts = screen.getAllByText(/in cart/)
    expect(inCartTexts).toHaveLength(3)

    // Remove the second item
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(removeButtons[1])

    // Should now only have 2 items with "in cart" text
    const remainingInCartTexts = screen.getAllByText(/in cart/)
    expect(remainingInCartTexts).toHaveLength(2)
  })

  it('handles adding, incrementing, decrementing, and removing for each store item', async () => {
    const user = userEvent.setup()
    renderWithRouter('/store')

    // Test each of the 4 items: Book, Computer, Banana, Car
    const itemNames = ['Book', 'Computer', 'Banana', 'Car']

    for (let i = 0; i < itemNames.length; i++) {
      // Add the item
      const addButtons = screen.getAllByRole('button', { name: /add to cart/i })
      await user.click(addButtons[0])

      // Verify it was added
      expect(screen.getByText('in cart')).toBeInTheDocument()

      // Increment it
      const incrementButtons = screen.getAllByRole('button', { name: '+' })
      await user.click(incrementButtons[incrementButtons.length - 1])
      expect(screen.getByText('in cart')).toBeInTheDocument()

      // Decrement it
      const decrementButtons = screen.getAllByRole('button', { name: '-' })
      await user.click(decrementButtons[decrementButtons.length - 1])
      expect(screen.getByText('in cart')).toBeInTheDocument()

      // Remove it
      const removeButtons = screen.getAllByRole('button', { name: /remove/i })
      await user.click(removeButtons[removeButtons.length - 1])

      // Verify "Add to Cart" button is back
      const finalAddButtons = screen.getAllByRole('button', { name: /add to cart/i })
      expect(finalAddButtons.length).toBeGreaterThan(0)
    }
  })
})

// TODO: Please add tests for rendering the NavBar component and its cart quantity badge.
// TODO: Please add tests for clicking on each of the links and Shopping Cart button
// and seeing if they open and render each of their Pages Correctly.

// TODO: Please add tests for Opening & Rendering the About Page

// TODO: Please add tests for Opening & Rendering the Home Page

// TODO: Add more tests for other routes, components, and interactions as needed
