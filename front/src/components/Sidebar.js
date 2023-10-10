import { CloudIcon } from '../svg/CloudIcon.js'
import { Link } from 'react-router-dom'
import { LibraryIcon } from '../svg/LibraryIcon.js'
import { YtIcon } from '../svg/YtIcon.js'
import ActionsMenu from './ActionsMenu.js'

export default function Sidebar() {

  return (
      <div className='sidebar controller'>
          <div className='sidebar-list wrapper'>
            <ul className='sidebar-list'>
              <li key='extract' className='sidebar-item'>
                  <button className='sidebar-btn actions'>
                      <CloudIcon>
                      </CloudIcon>
                      <ActionsMenu></ActionsMenu>
                  </button>
            </li>
            <li key='library' className='sidebar-item'>
              <button className='sidebar-btn'>
                  <Link to='/library' className='sidebar-link'>
                    <LibraryIcon>
                    </LibraryIcon>
                  </Link>
                </button>
              </li>
              </ul>
          </div>
          <div className='yt-link'>
            <form method='get' action={`${process.env.REACT_APP_SERVER}/authorize`}>
              <input type='submit' name='submit' />
                <button className='sidebar-btn actions-btn'>
                  <YtIcon></YtIcon>
                </button>
            </form>
          </div>
      </div>
  )
}