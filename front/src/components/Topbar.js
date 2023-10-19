import { Link, NavLink, useLocation } from 'react-router-dom'
import { SettingsIcon } from '../svg/clouds'
import { useContext, useEffect, useRef } from 'react'
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

  let defaultVals = JSON.parse(localStorage.getItem('Config'))

  if (defaultVals === null) {
    defaultVals = {
      'model': 'Confident',
      'threshold': '0.5',
      'n_frames': '8'
    }
  }

  const loc = useLocation()

  const cloudCount = JSON.parse(localStorage.getItem('cloudCount')) 

  const confRef= useRef()
  const sensRef = useRef()
  const cloudRef = useRef()


  function unfocus(e) {
    e.target.blur()
  }

  function toggleModelChoice(clicked, otherBtn) {
    clicked.target.classList.add('active')
    otherBtn.current.classList.remove('active')
  }

  useEffect(() => {
    if (confRef.current !== undefined && defaultVals.model === 'Confident') {
      confRef.current.classList.add('active')
    } else if (sensRef.current !== undefined && defaultVals.model === 'Sensitive') {
      sensRef.current.classList.add('active')
    }
  }, [confRef, sensRef])
  
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
              <Link  to='/extract' 
              state={{'from': loc.pathname}}
              className='actions main-link extract'>
                <CloudSearchIcon /> 
              </Link>
              <Link to= '/extract-many' 
              className='actions main-link extract-many'
              state={{'from': loc.pathname}}>
                <TwoClouds />
              </Link>
              <Link className='actions main-link'>
                <FactoryIcon />
              </Link>
            </div>
              <div className='quick-actions rows'>
                <Link to='/extract'
                  state={{'from': loc.pathname}}
                  className='action-row extract actions '>
                  <CloudSearchIcon />
                <span>Capture from a single file</span>
                </Link>
                <Link to='/extract-many'
                  state={{'from': loc.pathname}}
                  className='action-row actions'>
                  <TwoClouds />
                <span>Capture from many files</span>
                </Link>
                <Link to='/extract-live'
                  state={{'from': loc.pathname}}
                  className='action-row actions '>
                  <FactoryIcon />
                <span>Capture from livestream</span>
                </Link>
              </div>
            </div>
          </button>

          {/* <form action={process.env.REACT_APP_AUTH_URI}>
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
          </form> */}

          <Link
            to='/yt/auth'
            style={{width: '60px'}}>
            <YoutubeIcon />
          </Link>
      </div>
      <div className='right-icons'>
        <div id='cloud-counter' ref={cloudRef}>
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
                className='model-choice'
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
              <span>Seconds Per Capture</span>
              <input type='number'
              name='n_frames'
              min='8'
              onChange={e => updateConfig(e)}
              defaultValue={defaultVals['n_frames']}
              />
            </div>
            <div className='settings-save submit-input'>
              <input type='submit'
              name='video_size'
              value='Done' 
              onClick={e => unfocus(e)}/>
            </div>
          </form> 
        </button> 
      </div>
    </div>
  )
}