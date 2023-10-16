import CloudLoader from '../components/CloudLoader'
import { renderWithRouter } from '../setupTests'

it('renders CloudLoader without crashing', () => {
  renderWithRouter('/cloud/mock_clip_1.mp4', <CloudLoader />)
})