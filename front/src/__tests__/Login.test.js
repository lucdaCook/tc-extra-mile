import { renderWithRouter } from '../setupTests'
import Login from '../components/Login'
import { getByLabelText } from '@testing-library/react'

it('renders Login componenet and the form labels are visible', () => {
  renderWithRouter('lg/in', <Login />)

})
