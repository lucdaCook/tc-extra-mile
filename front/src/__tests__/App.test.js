import Root from '../App'
import CloudsContextProvider from '../contexts/CloudsContext'
import { renderWithRouter } from '../setupTests'

it('renders Root component without crashing', () => {
  renderWithRouter('/', <Root />)
}) 
