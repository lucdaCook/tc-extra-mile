import Window from '../components/Window'
import { renderWithRouter } from '../setupTests'

it('renders Window (many and not) without crashing', () => {
  const manys = [true, false]

  manys.forEach(many => {
    if (many === true){
      renderWithRouter('/extract-many', <Window many={many} />)
  } else {
    renderWithRouter('/extract', <Window many={many} />)
  }
})
})