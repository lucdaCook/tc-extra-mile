import CloudsLoader from '../components/CloudsLoader'
import { renderWithRouter } from '../setupTests'

it('render CloudsLoader without crashing', () => {
  renderWithRouter('/clouds/0', <CloudsLoader />)
})