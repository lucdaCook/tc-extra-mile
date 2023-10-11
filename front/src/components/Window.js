import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { CloudsContext } from "../contexts/CloudsContext"

export default function Window({ many }) {

  const { predictOnVideo, predictOnManyVideos, setExtracted } = useContext(CloudsContext)
  const nav = useNavigate()


  {/* <div></div>
  <div></div> form square aroud player and on click exit with Links
  <div></div>
  <div></div> */}

  return (
      <div className="container">
        <div className="view-refresh">
          <div className="action-window popup"> 
            <div className="form-window">

              {
                many ? 
                <input type="file" 
                name='file' 
                multiple
                onChange={e => predictOnManyVideos(e, nav)}
                className="video-select"
                  /> 
                :
                <input type="file" 
                name='file' 
                onChange={e => predictOnVideo(e, nav)}
                className="video-select"
                  /> 
              }
              </div>
              <div className="form-info">
                <span>Let's say tata to emissions!
                  <p>Upload your file{ many ? 's' : ''} here and I'll 
                    let you know if there are any toxic clouds present.</p>
                </span>
              </div>
            <button className="window-exit" 
            onClick={() => {
              nav(-1)
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