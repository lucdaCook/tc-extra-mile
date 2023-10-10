import { CloudLogo } from '../svg/CloudLogo'
import { Link } from 'react-router-dom'
export default function Topbar() {

  return (
    <div className='topbar nav'>
      <Link to='/' className='home-link'>
        <CloudLogo>
        </CloudLogo>
      </Link>
    </div>
  )
}