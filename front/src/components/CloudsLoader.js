import { useContext, useEffect, useRef, useState } from "react"
import { CloudsContext } from "../contexts/CloudsContext"
import { useNavigate, useLoaderData } from 'react-router-dom'
import { CloudDownload } from '../svg/clouds'
import FeedbackForm from "./FeedbackForm"

export default function CloudsLoader() {

  const cloudsId = useLoaderData() 
  const { logs, setExtracted, submitFeedback } = useContext(CloudsContext)
  const mainVidRef = useRef()
  const nav = useNavigate()
  const videos = process.env.REACT_APP_SERVER
  const [ currentVidBlob, setCurrentVidBlob ] = useState()
  
  const info = logs[cloudsId]
  
  useEffect(() => {
    if(info === undefined || info === null) { 
      nav('/extract', {state: {'from': '/'}})
    }
  }, [info])

  function fetchCurrentBlob(vid) {
    fetch(vid)
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob)
      setCurrentVidBlob(url)
    })
  }

  function toggleVideo(e) {
    const prevMainSrc = mainVidRef.current.src
    const clickedSrc = e.currentTarget.src

    e.currentTarget.src = prevMainSrc
    e.currentTarget.width = '100'
    e.currentTarget.height = '100'
    
    mainVidRef.current.src = clickedSrc
    mainVidRef.current.width = '512'
    mainVidRef.current.height = '512'
    mainVidRef.current.focus()

    fetchCurrentBlob(mainVidRef.current.src)
    mainVidRef.current.focus()
    
  }

  useEffect(() => {
    if (mainVidRef.current && mainVidRef.current.src !== undefined) {
      fetchCurrentBlob(mainVidRef.current.src)
      mainVidRef.current.focus()
    }
  }, [mainVidRef])

  return (
    <div className="container">
      <div className="view-refresh">
        <div className="action-popup clouds-display"> 
{ 

    info?.written.length > 0 ?
  
        <>
          <div className="vid-padding"></div> 
            <div className="player-window"> 
              <div className="video-overlay">
                <video controls className="main-video" 
                ref={mainVidRef} 
                src={`${videos}/model/${info.written[0]}`}
                onMouseEnter={(e) => e.currentTarget.controls = true}
                onMouseLeave={(e) => e.currentTarget.controls = false} 
                />
              </div> 
            </div> 
            <FeedbackForm info={info}/>
        <div className='player-row extras' >
          <div className="video-widgets">
          {
            info?.written.slice(1, 3).map((vid, i) => (
              <div className={`extras-widget` + ( info.written.length >= 3 && i === 0 ? ' align-left' : '')} key={i}>
              <video placeholder="placeholder.png" 
              onClick={(e) => toggleVideo(e)}
              className="video-placeholder"
              width='512'
              height='512'
              src={`${videos}/model/${vid}`} 
              > 
              </video>
            </div>
          ))
        }
        </div>
        <div className="player-extras buttons plural">
              {
                mainVidRef.current &&
              <a className="download-cloud"
                type="submit" download={mainVidRef.current.src.split('/').at(-1)} href={currentVidBlob}>
                <CloudDownload />
              </a>
              }
          <span 
          className="nav-library view-library"
          onClick={() => nav('/library', {state: {'justCaptured': info.n_captured}})}
          >
            View in Library
          </span>
        </div>
        </div>
        </>
        :
        <div className="not-captured">
        </div>
}
      <button className="window-exit" 
      onClick={() => {
        nav(-2)
        setExtracted(false)
        }}
        >
      <div className='exit-widget'>
        <div className="exit-content"></div>
          </div>
        </button>
      </div>
    </div>
      
  </div>


  )
}