import { CredentialsContext } from "../contexts/CredentialsContext"
import { useContext, useEffect, useState, useRef } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { CloudsContext } from "../contexts/CloudsContext"

export default function YoutubeWindow() { 

  const { youtube } = useContext(CredentialsContext)
  const { extractFromLivestream } = useContext(CloudsContext)
  const [ livestreamData, setLivestreamData ] = useState({})
  const [ streamChosen, setStreamChosen ] = useState('')
  const [ keepMonitoring, setKeepMonitoring ] = useState(false)
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
    let cont = keepMonitoring
    // let first = true 
    // this is for if something arises when switching between streams and we need to reset live captures
    while(cont !== null && keepMonitoring === true) { 

      // if (first) {
      //   setRecentCapture({'totalCaps': 0})
      // }
      console.log('extracting...')
      const ret = await extractFromLivestream(streamChosen)
      setRecentCapture(prev => {
       return {...ret, 'totalCaps': prev.totalCaps + 1}
      })
      
      cont = livestreamRef.current
    }
  }


  useEffect(() => {
    if (keepMonitoring === true){
      monitor()
    } else {
      setRecentCapture({'totalCaps': 0})
    }

  }, [keepMonitoring])

  useEffect(() => {
    setRecentCapture({'totalCaps': 0})
  }, [streamChosen])

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
    if (recentCapture.totalCaps > 0) {
      liveCounterRef.current.classList.add('plus-one')

      setTimeout(() => {
        liveCounterRef.current.classList.remove('plus-one')
      }, 2000)
    }
  }, [recentCapture])

  return (
    <div className="container">
      <div className="view-refresh">
        <div className="action-window popup youtube">
          <div className={`livestream-choices${+ streamChosen !== '' ? ' active' : ''}`}>
            {!streamChosen ?
            livestreamData?.items?.map((vid, i) => (
              <div className="livestream-choice" key={i}>
                <button 
                  className="choose-livestream"
                  onClick={e => {
                    setStreamChosen(e.target.nextSibling.src)
                    setKeepMonitoring(true)
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
                <iframe src={`${streamChosen}?autoplay=1&mute=1&fs=1`} 
                allow="autoplay"
                width='670px' height='475px' title="livestream"
                ref={livestreamRef}/>

              {
              // recentCapture.totalCaps > 0 &&
              //     <div
              //       className='live-capture reward-container'
              //     >
              //         {/* <video 
              //         src='../testing.mp4' 
              //         placeholder="justCaptured.png" 
              //         width='80px' height='80px'
              //         className="live-reward png"/> */}
              //         <span>+1</span>
              //       </div>

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
                  setKeepMonitoring(false)
                  setStreamChosen('')
                  livestreamRef.current.src = undefined
                }}
                >Stop monitoring</button>
                <Link 
                to='/library' 
                state={{'justCaptured': recentCapture.totalCaps}}
                onClick={() => setKeepMonitoring(false)}
                >Go to library</Link>
              </div>
            </>
            }
          </div>
          <button className="window-exit"
            onClick={() => {
              setKeepMonitoring(false)
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