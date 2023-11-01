import { CredentialsContext } from "../contexts/CredentialsContext"
import { useContext, useEffect, useState, useRef, useCallback } from "react"
import { useLocation, useNavigate, Link, useBeforeUnload } from "react-router-dom"
import { CloudsContext } from "../contexts/CloudsContext"

export default function YoutubeWindow() { 

  const { youtube } = useContext(CredentialsContext)
  const { extractFromLivestream } = useContext(CloudsContext)
  const [ livestreamData, setLivestreamData ] = useState({})
  const [ keepMonitoring, setKeepMonitoring ] = useState({'streamChosen': '', 'keepMonitoring': false})
  const [ askToContinue, setAskToContinue ] = useState({})
  const [ recentCapture, setRecentCapture ] = useState({'totalCaps': 0})
  const livestreamRef = useRef()
  const liveCounterRef = useRef()
  const loc = useLocation()
  const locState = loc.state
  const nav = useNavigate()
  let embedWidth = 920
  let embedHeight = 300
  
  // const formRef = useRef()
  // const [ youtube, setYoutube ] = useState('') auth method 2
  // const code =  new URLSearchParams(window.location.hash).get('access_token')
  // if (code !== null) {
  //   window.history.pushState({}, null, '/')
  //   setYoutube(code)
  // }

  useBeforeUnload(
    useCallback(() => {
      if(keepMonitoring.keepMonitoring === true) {
        abort()
      }
    }, [keepMonitoring])
  )

  if (window.innerWidth < 1000) {
    embedWidth = 600
    embedHeight = 240
  } else if (window.innerWidth < 1275) {
    embedWidth = 700
    embedHeight = 260
  }

  let exitTo;

  if(locState !== null && locState.from) {
    exitTo = locState.from
  }

  function abort() {
    console.log('aborting...')
    // if (livestreamRef.current){
    //   livestreamRef.current.src = undefined
    // }
    fetch('http://localhost:8000/model/abort')
    .then(res => res.json()) 
    .then(json => {
      console.log('BREAKPOINT FROM JS', json)
      setKeepMonitoring({
        streamChosen: '',
        keepMonitoring: false
      })
      setRecentCapture({'totalCaps': 0})
    })
  }

  const monitor = async () => {
  let cont = keepMonitoring['keepMonitoring']

  while(cont !== null &&  keepMonitoring['keepMonitoring'] === true) { 
  const ret = await extractFromLivestream(keepMonitoring.streamChosen, nav)

  if (ret.status === 205) {
    break
  }
  else if (ret.status === 300) {
  setAskToContinue(ret)
  setKeepMonitoring(prev => { return {...prev, 'keepMonitoring': false}})
  break
  } else if (ret.status === 400) {
  livestreamRef.current = null
  setKeepMonitoring({'streamChosen': '', 'keepMonitoring': false})
  nav('/error')
  break
  }

  setRecentCapture(prev => {
  return {...ret, 'totalCaps': prev.totalCaps + 1}
  })
      
  cont = livestreamRef.current
  }
  }


  useEffect(() => {
    console.log(keepMonitoring)
    if (keepMonitoring['keepMonitoring'] === true){
      monitor()
    } else {
      setRecentCapture({'totalCaps': 0})
    } 
  }, [keepMonitoring])

  useEffect(() => {

    if (youtube && livestreamRef.current === undefined) {
      console.log(youtube, 'FROM WINDOW')
      fetch('https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=UCMWAY35jAiyzkQ83WopFlfg&eventType=live&type=video', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${youtube}`,
          'Accept': 'application/json'
        }}).then(res => {
          if (!res.ok) {
            throw res
          }
          return res.json()
        }).then(json => {
          console.log('setting livestreamData json is :', json)
          setLivestreamData(json)
        }).catch(error => {
          // if (error.status === 401) { TODO: figure which error status means quota is reached 401 and 403 seem to not be it all the time 
          //   nav('/error', {state: {'message': 'Looks have reached your live inference limits for the day.'}})
          // } else {
            console.log(error)
        // }
        })
    } else {
        nav('/yt/auth', {state: {'from': locState.from}})
          // nav('/') auth Method 2
          // formRef.current.submit()
    }
  }, [])

  useEffect(() => {
  console.log(recentCapture)
  if (liveCounterRef.current !== null && recentCapture.totalCaps > 0) {
  liveCounterRef.current.classList.add('plus-one')

  setTimeout(() => {
  if (liveCounterRef.current !== null) {
  liveCounterRef.current.classList.remove('plus-one')
  }
      }, 2000)
  }
  }, [recentCapture])

  useEffect(() => {
    if(livestreamRef.current && keepMonitoring['keepMonitoring'] === false) {
      abort()
    }
  }, [keepMonitoring])


  return (
    <div className="container">
      <div className="view-refresh">
        <div className="action-window popup youtube">
          <div className={`livestream-choices${+ keepMonitoring.streamChosen !== '' ? ' active' : ''}`}>
            {!keepMonitoring?.streamChosen ? 
            livestreamData?.items?.map((vid, i) => (
              <div className="livestream-choice" key={i}>
                <button 
                  className="choose-livestream"
                  onClick={e => {
                    setKeepMonitoring(() => {
                      return {'streamChosen': e.target.nextSibling.src, 'keepMonitoring': true}
                    })
                    e.target.blur()
                  }}
                >
                  {livestreamData.items[i].snippet.title.split('-').at(1)}
                  </button>
                <iframe src={`https://www.youtube.com/embed/${vid.id.videoId}?frameBorder='0'`} 
                width={livestreamData.items.length > 1 ? embedWidth / livestreamData.items.length : '420px'} 
                height={embedHeight}
                title={`livestream-${i}`}
                />
              </div>
            ))
            :
            <>
              <div className="livestream" style={{position: 'relative'}}>
                <iframe src={`${keepMonitoring.streamChosen}?autoplay=1&mute=1&fs=1`} 
                allow="autoplay"
                width={window.innerWidth > 1120 ? '670px' : '550px'} 
                height={window.innerWidth > 1420 ? '475px' : '400px'} 
                 title="livestream"
                ref={livestreamRef}/>

              {JSON.stringify(askToContinue) !== '{}' && 
                  <div
                    className='ask-continue'
                  >
                    <span>{askToContinue.status === 300 && `${askToContinue.message}`}</span>
                    <button
                    onClick={() => {
                      setKeepMonitoring(prev => { 
                        return {...prev, 'keepMonitoring': true}
                      })
                      setAskToContinue({})
                    }}
                    >
                      Want to keep going?
                    </button>
                    <button
                      onClick={() => nav('/')}
                    >
                      Exit
                    </button>
                  </div>

                    }
              </div>
              <div className="stream-extras">
                <div className="live-counter"
                ref={liveCounterRef}>
                  <span>
                    Captured: {recentCapture.totalCaps}
                  </span>
                </div>
                <button 
                className="stop-livestream"
                onClick={() => abort()}
                >Stop monitoring</button>
                <Link 
                to='/library' 
                state={{'justCaptured': recentCapture.totalCaps}}
                onClick={() => abort()}
                >Go to library</Link>
              </div>
            </>
            }
          </div>
          <button className="window-exit"
            onClick={() => {
              if (keepMonitoring['keepMonitoring']){
                abort()
              }
              if (exitTo) {
                console.log('EXIT TO ', exitTo)
                nav(exitTo)
              } else {
                nav(-1)
              }
            }}
          >
            <div className="exit-widget">
              <div className="exit-content"></div>
            </div>
          </button>
        </div>
      </div>
      {/* <form action='https://accounts.google.com/o/oauth2/v2/auth'
          ref={formRef}
          >
          <input type='hidden' 
          name='client_id'
          value = '208551081122-23vbrtn2fr01uftns27nigcs085g1vb5.apps.googleusercontent.com' />
          <input type='hidden'
          name='redirect_uri'
          value = 'http://localhost:3000/extract-live' />
          <input type='hidden'
          name='response_type'
          value = 'token' />
          <input type='hidden'
          name='scope'
          value = 'https://www.googleapis.com/auth/youtube.force-ssl' />
          <input type='hidden'
          name='include_granted_scopes'
          value ='true' />
          <input type='hidden'
          name='state'
          value ='pass-through value' />
        </form> auth method 2*/}
    </div>

    
  )
} 