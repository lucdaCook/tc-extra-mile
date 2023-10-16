import Root from '../App'
import { renderWithRouter } from '../setupTests'

it('renders Root component without crashing', () => {
  renderWithRouter('/', <Root />)
}) 
