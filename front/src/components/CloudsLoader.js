import { useContext, useEffect, useRef, useState } from "react"
import { CloudsContext } from "../contexts/CloudsContext"
import { useNavigate, useLoaderData, Form } from 'react-router-dom'
import { CloudDownload, UploadCloud } from '../svg/clouds'

export default function CloudsLoader() {

  const cloudsId = useLoaderData() 
  const { logs, setExtracted } = useContext(CloudsContext)
  const mainVidRef = useRef()
  const nav = useNavigate()
  const videos = process.env.REACT_APP_SERVER
  const [ currentVidBlob, setCurrentVidBlob ] = useState()
  
  const info = logs[cloudsId]
  
  useEffect(() => {
    if(info === undefined) { 
      nav('/extract')
    }
  }, [])

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
    
  }

  useEffect(() => {
    if (mainVidRef.current !== undefined)
    fetchCurrentBlob(mainVidRef.current.src)
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
        <div className="player-extras buttons">
        {/* <Form action="/yt/send" method="POST">
              <input type='hidden'
                name='upload'
                value = {JSON.stringify(info)}
              /> */}
              {
                mainVidRef.current &&
              <a className="download-cloud"
                type="submit" download={mainVidRef.current.src.split('/').at(-1)} href={currentVidBlob}>
                <CloudDownload />
              </a>
              }
            {/* </Form> */}
          <a>
            View in library
          </a>
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