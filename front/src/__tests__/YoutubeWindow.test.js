import { renderWithRouter } from '../setupTests'
import YoutubeWindow from '../components/YoutubeWindow'

// it('renders YoutubeWindow without crashing', () => {
//   renderWithRouter('/extract-live', <YoutubeWindow />)
// })

// i think this fails because of something with the youtube api calls and redirects
it('renders Yt Window without crashing', () => {
  renderWithRouter('/extract-live', <YoutubeWindow />)
  

})