import { useContext, useRef } from "react"
import { CloudsContext } from "../contexts/CloudsContext"
import { useLoaderData } from "react-router-dom"
import { useNavigate } from 'react-router-dom'

export default function CloudLoader() {

  const cloudId = useLoaderData() 
  const { extracted, setExtracted } = useContext(CloudsContext)
  
  const mainVidRef = useRef()
  const nav = useNavigate()
  
  const videos = process.env.REACT_APP_SERVER

  return (


    <div className="container">
      <div className="view-refresh">
        <div className="action-window popup"> 
{ extracted &&
  
        <>
          <div className="vid-padding"></div> 
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
        </div>
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