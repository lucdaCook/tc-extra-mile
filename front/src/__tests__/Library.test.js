import Library from '../components/Library'
import { renderWithRouter } from '../setupTests'

it('renders Library without crashing', () => {
  renderWithRouter('/library', <Library />)
})
