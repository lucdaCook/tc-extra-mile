import { useContext, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CloudsContext } from "../contexts/CloudsContext"
import { PlayIcon, VideoAdd } from "../svg/clouds"

export default function Window({ many }) {

  const { predictOnVideo, predictOnManyVideos, setExtracted } = useContext(CloudsContext)
  const nav = useNavigate()
  const locState = useLocation().state

  let exitTo;

  if(locState !== null && locState.from) {
    exitTo = locState.from
  }

  const [ extracting, setExtracting ] = useState(false)

  return (

    <div className="container">
        <div className="view-refresh">
          <div className="action-window action-popup" > 
              { extracting ?
                <div className="clouds-loading">Loading..</div>
              :
              <>
              <div className="form-window">
              
            { 
              many ? 
                <input type="file" 
                name='file' 
                multiple
                className="video-select" 
                onChange={e => {
                  setExtracting(true)
                  predictOnManyVideos(e, nav)
                }}
                /> 
                :
                  <input type="file" 
                  name='file' 
                  onChange={e => {
                    setExtracting(true)
                    predictOnVideo(e, nav)
                  }}
                  className="video-select"
                    /> 
              }
              <VideoAdd />
              <PlayIcon />
              </div>
              <div className="form-info">
                <span>Let's say tata to emissions!
                  <p>Upload your file{ many ? 's' : ''} here and I'll 
                    let you know if there are any toxic clouds present.</p>
                </span>

              </div>
              </>
              }
            <button className="window-exit" 
            onClick={() => {
              if (exitTo){
                nav(exitTo)
              } else {
              nav(-1)
              }
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