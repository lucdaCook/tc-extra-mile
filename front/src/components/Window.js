import { useRef, useEffect, useContext } from "react"
import { useFetcher, useNavigate } from "react-router-dom"
import { CloudsContext } from "../contexts/CloudsContext"

export default function Window() {

  const { logs, predictOnVideo } = useContext(CloudsContext)
  const mainVidRef = useRef(null)
  const nav = useNavigate()
  const fetcher = useFetcher()

  console.log(logs)
 
  {/* <div></div>
  <div></div> form square aroud player and on click exit with Links
  <div></div>
  <div></div> */}

  return (
      <div className="container">
        <div className="view-refresh">
          <div className="action-window popup"> 
          <div className="form-window">
            {/* <Form > */}
                <input type="file" 
                name='file' 
                onChange={e => predictOnVideo(e, fetcher)}
                className="video-select"
                /> 
            {/* </Form>  */}
                <span>Upload a video</span>
            </div>
            <button className="window-exit" onClick={() => nav(-1)}>
              <div className='exit-widget'>
                <div className="exit-content"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
  )
  }