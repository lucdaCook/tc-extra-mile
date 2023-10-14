import { useContext, useRef, useEffect, useState } from "react"
import { CloudsContext } from "../contexts/CloudsContext"
import { useNavigate, useLoaderData } from 'react-router-dom'
import { CloudDownload } from "../svg/clouds"

export default function CloudLoader() {

  const cloudId = useLoaderData()  

  console.log(cloudId)
  const { extracted, setExtracted } = useContext(CloudsContext)
  const [ blobUrl, setBlobUrl ] = useState('')
  
  const mainVidRef = useRef()
  const nav = useNavigate()
  
  const videos = process.env.REACT_APP_SERVER

  useEffect( () => {
    fetch(`${videos}/model/clip/${cloudId}`)
    .then(res => res.blob())
    .then(blob => {
     const url = URL.createObjectURL(blob)
     setBlobUrl(url)
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
            

        <div className='slider-row extras'>
          {/* <div className="blob-link"> */}
          <a href={blobUrl} download={cloudId} className='blob-anchor' 
          title="Download">
            <CloudDownload />
          </a> 
          </div>
        {/* </div> */}
      <button className="window-exit" onClick={() => {
        nav(-1)
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