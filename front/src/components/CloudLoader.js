import { useContext, useRef, useEffect, useState } from "react"
import { CloudsContext } from "../contexts/CloudsContext"
import { useNavigate, useLoaderData, useLocation } from 'react-router-dom'
import { CloudDownload } from "../svg/clouds"
import FeedbackForm from "./FeedbackForm"

export default function CloudLoader() {

  const cloudId = useLoaderData()  
  const { extracted, setExtracted } = useContext(CloudsContext)
  const [ blobUrl, setBlobUrl ] = useState('')
  const locState = useLocation().state

  let exitTo;

  if(locState !== null && locState.from) {
    exitTo = locState.from
  }
  
  const mainVidRef = useRef()
  const nav = useNavigate()
  
  const videos = process.env.REACT_APP_SERVER

  useEffect( () => {
    fetch(`${videos}/model/clip/${cloudId}`)
    .then(res => res.blob())
    .then(blob => {
     const url = URL.createObjectURL(blob)
     setBlobUrl(url)
     setExtracted(true)
    })
  }, []) 

  return (

    <div className="container"> 
      <div className="view-refresh">
        <div className="action-popup clouds-display">  
{ extracted &&
   
        <>
            <div className="player-window"> 
              <div className="video-overlay">
                <video controls className="main-video" 
                ref={mainVidRef} 
                src={`${videos}/model/clip/${cloudId}`}
                onMouseEnter={(e) => e.currentTarget.controls = true}
                onMouseLeave={(e) => e.currentTarget.controls = false}
                />
              </div> 
            </div> 
            
          <FeedbackForm info={cloudId}/>
        <div className='slider-row extras'
        style={{'transform': 'translate(50%)'}}>
          <a href={blobUrl} download={cloudId} className='blob-anchor' 
          title="Download">
            <CloudDownload />
          </a> 
          </div>
      <button className="window-exit" onClick={() => {

        if (exitTo) {
          nav(exitTo)
        }
        else {
        nav(-1)
        }
        setExtracted(false)
        }}>
      <div className='exit-widget'>
        <div className="exit-content"></div> 
          </div>
        </button>
        </>
}
      </div>
    </div>
      
  </div>


  )
}