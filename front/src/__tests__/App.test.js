import Root from '../App'
import { renderWithRouter } from '../setupTests'
import { screen } from '@testing-library/react'

it('renders Root component without crashing', () => {
  renderWithRouter('/', <Root />)
}) 

test('One of the backdrops appear', () => {
  renderWithRouter('/', <Root />)
  if (JSON.parse(localStorage.getItem('showTata')) === true) {
    expect(screen.getByTestId('tata-backdrop')).toBeInTheDocument()
  } else if (JSON.parse(localStorage.getItem('showTata')) === false) {
    expect(screen.getByTestId('trees-backdrop')).toBeInTheDocument()
  }
})
