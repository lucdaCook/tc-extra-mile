import { useContext, useEffect, useRef } from "react"
import { CloudsContext } from "../contexts/CloudsContext"
import { useLoaderData } from "react-router-dom"
import { useNavigate } from 'react-router-dom'

export default function CloudsLoader() {

  const cloudId = useLoaderData() 
  const { logs, extracted } = useContext(CloudsContext)
  const mainVidRef = useRef()
  const nav = useNavigate()
  const videos = process.env.REACT_APP_SERVER


  console.log(logs)

  

  const info = logs[cloudId]
  

  useEffect(() => {
    if(info === undefined) { 
      nav('/extract')
    }
  }, [])



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
    
  }


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
                src={`${videos}/model/${info.written[0]}`}
                onMouseEnter={(e) => e.currentTarget.controls = true}
                onMouseLeave={(e) => e.currentTarget.controls = false}
                />
              </div> 
            </div> 
            

        <div className='player-row extras' style={{
          gridTemplateColumns: `repeat(${info.written.length - 1}, 100px)`
        }}>
          {
            info.written.slice(1).map((vid, i) => (
              <div className={`extras-widget` + ( i === 0 ? ' align-left' : '')} key={i}>
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
      <button className="window-exit" onClick={() => nav(-2)}>
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