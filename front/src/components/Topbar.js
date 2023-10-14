import { Link, NavLink } from 'react-router-dom'
import SettingsIcon from '../svg/SettingsIcon'
import { useContext, useRef } from 'react'
import { CloudsContext } from '../contexts/CloudsContext'
import { 
  CloudIcon, 
  FactoryIcon, 
  CloudSearchIcon, 
  TwoClouds,
  LibraryIcon,
  YoutubeIcon
} from '../svg/clouds'

export default function Topbar() {

  const { updateConfig } = useContext(CloudsContext)

  const defaultVals = JSON.parse(localStorage.getItem('Config'))

  const cloudCount = JSON.parse(localStorage.getItem('cloudCount')) 

  const confRef= useRef()
  const sensRef = useRef()


  function unfocus(e) {
    e.target.blur()
  }

  function toggleModelChoice(clicked, otherBtn) {
    clicked.target.classList.add('active')
    otherBtn.current.classList.remove('active')
  }

  const ytParams = {
    'clientId': '208551081122-23vbrtn2fr01uftns27nigcs085g1vb5.apps.googleusercontent.com',
    'redirect_uri': 'http://localhost:3000/',
    'response_type': 'token',
    'scope': 'https://www.googleapis.com/auth/youtube.force-ssl',
    'include_granted_scopes': 'true',
    'state': 'pass-through value'
  }

  return (
    <div className='topbar nav'>
      <div className='left-icons'>
        <Link to='/' className='home-link'>
          {/* You know what to do here */}
        </Link>
        <button className='actions-btn actions'>
            <CloudIcon />
            <div className='actions-after' >
              <div className='actions-main'>
              <Link  to='/extract' className='actions main-link extract'>
                <CloudSearchIcon /> 
              </Link>
              <Link to= '/extract-many' className='actions main-link extract-many'>
                <TwoClouds />
              </Link>
              <Link className='actions main-link'>
                <FactoryIcon />
              </Link>
            </div>
              <div className='quick-actions rows'>
                <Link>Hey</Link>
                <a>Hey</a>
                <a>Hey</a>
                <a>Hey</a>
              </div>
            </div>
          </button>

          <form action={process.env.REACT_APP_AUTH_URI}>
            <input type='hidden' 
            name='client_id'
            value = {process.env.REACT_APP_CLIENT_ID} />
            <input type='hidden'
            name='redirect_uri'
            value = {process.env.REACT_APP_REDIRECT_URI} />
            <input type='hidden'
            name='response_type'
            value = 'token' />
            <input type='hidden'
            name='scope'
            value = {process.env.REACT_APP_SCOPE} />
            <input type='hidden'
            name='include_granted_scopes'
            value ='true' />
            <input type='hidden'
            name='state'
            value ='pass-through value' />
            <button type='submit'
              style={{width: '60px'}}>
              <YoutubeIcon />
            </button>
          </form>

      </div>
      <div className='right-icons'>
        <div id='cloud-counter'>
          <CloudIcon />
          <span>{cloudCount}</span>
        </div>
        <NavLink to='/library' className='library white' title='Your Library'>
          <LibraryIcon />
        </NavLink>
        <button className='settings'>
          <SettingsIcon /> 
          <form 
          className='settings-after'
          onSubmit={e => {
            e.preventDefault()
          }}
            >
            <div className='settings-row model-config'>
              <span>Model Nature</span>
                <div className='model-choices setting-choice'>
                <input type='button' 
                className='model-choice'
                value='Sensitive'
                name='model'
                onClick={e => {
                  updateConfig(e)
                  toggleModelChoice(e, confRef)
                }}
                ref={sensRef}
                />
                <input type='button'
                className={'model-choice'
                }
                ref={confRef}
                name='model'
                value='Confident'
                onClick={e => {
                  updateConfig(e)
                  toggleModelChoice(e, sensRef)
                }}
                />
              </div>
            </div>
            <div className='threshold-slider settings-choice'>
              <span>Prediction Threshold</span>
                <span>{defaultVals['threshold']}</span>
              <input type='range' 
              name='threshold'
              step='0.1'
              min='0'
              max='1.0'
              
              onChange={e => updateConfig(e)}
              value={defaultVals['threshold']}
              />
            </div>
            <div className='num-frames settings-choice'>
              <span>Seconds per capture</span>
              <input type='number'
              name='n_frames'
              min='8'
              onChange={e => updateConfig(e)}
              defaultValue={defaultVals['n_frames']}
              />
            </div>
            <div className='settings-save'>
              <input type='submit'
              name='video_size'
              value='save' 
              onClick={unfocus}/>
            </div>
          </form> 
        </button> 
      </div>
    </div>
  )
}