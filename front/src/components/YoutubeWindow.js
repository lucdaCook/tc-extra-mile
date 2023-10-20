import { CredentialsContext } from "../contexts/CredentialsContext"
import { useContext, useEffect, useState, useRef } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
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
  const locState = useLocation().state
  const nav = useNavigate()
  let embedWidth = 920

  if (window.innerWidth < 1000) {
    embedWidth = 600
  } else if (window.innerWidth < 1275) {
    embedWidth = 700
  }

  let exitTo;

  if(locState !== null && locState.from) {
    exitTo = locState.from
  }

  const monitor = async () => {
  let cont = keepMonitoring['keepMonitoring']

  while(cont !== null &&  keepMonitoring['keepMonitoring'] === true) { 
  console.log('extracting...')
  const ret = await extractFromLivestream(keepMonitoring.streamChosen, nav)

  if (ret.status === 205) {
    console.log('ABORTINGGG... FROM JS')
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

    if (youtube !== null && livestreamRef.current === undefined) {
      fetch(process.env.REACT_APP_FRISSEWIND_STREAMS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${youtube}`,
          'Accept': 'application/json'
        }}).then(res => {
          if(res.ok) {
            return res.json()
          } else {
            throw new Error(res.status)
          }
        }).then(json => {
          console.log('setting livestreamData json is :', json)
          setLivestreamData(json)
        }).catch(err => {
          console.log(err, 'this is most likely because: 1. youtube is not signed in 2. the quota has been reached')
          nav('/yt/auth', {state: {'from': '/extract-live'}})
          // nav('/error', {state: {'message': 'Did you sign into your Youtube account yet?', 'goTo': '/yt/auth'}})
        })
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
    console.log(askToContinue)
  }, [askToContinue])


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
                  }}
                >
                  {livestreamData.items[i].snippet.title.split('-').at(1)}
                  </button>
                <iframe src={`https://www.youtube.com/embed/${vid.id.videoId}?frameBorder='0'`} 
                width={livestreamData.items.length > 1 ? embedWidth / livestreamData.items.length : '420px'} 
                height={window.innerWidth < 1275 ? embedWidth / livestreamData.items.length : '300px'}
                title={`livestream-${i}`}
                />
              </div>
            ))
            :
            <>
              <div className="livestream" style={{position: 'relative'}}>
                <iframe src={`${keepMonitoring.streamChosen}?autoplay=1&mute=1&fs=1`} 
                allow="autoplay"
                width='670px' height='475px' title="livestream"
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
                onClick={() => {
                  livestreamRef.current.src = undefined
                  setKeepMonitoring({
                    streamChosen: '',
                    keepMonitoring: false
                  })
                  console.log('fetching for abort.....')
                  fetch('http://localhost:8000/model/abort')
                  .then(res => res.json())
                  .then(json => console.log('BREAKPOINT FROM JS', json))
                }}
                >Stop monitoring</button>
                <Link 
                to='/library' 
                state={{'justCaptured': recentCapture.totalCaps}}
                onClick={() => setKeepMonitoring({'streamChosen': '', 'keepMonitoring': false})}
                >Go to library</Link>
              </div>
            </>
            }
          </div>
          <button className="window-exit"
            onClick={() => {
              setKeepMonitoring({'streamChosen': '', 'keepMonitoring': false})
              setRecentCapture({'totalCaps': 0})
              if (exitTo) {
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
    </div>
  )
} 