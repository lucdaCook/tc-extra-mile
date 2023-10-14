import { useContext, useState, useEffect } from 'react'
import { CloudsContext } from '../contexts/CloudsContext'
import { useNavigate } from 'react-router-dom'

export default function Library() {

  const { logs, setExtracted } = useContext(CloudsContext)
  const vidServer = `${process.env.REACT_APP_SERVER}/model/`
  const nav = useNavigate()
  const [ activeSelect, setActiveSelect ] = useState(false)
  const [ selectionBlobs, setSelectionBlobs ] = useState([])

  let numWritten = 0

  logs.map(log => {
    numWritten += log.written.length
  })

  function watchCloud(cloud) {
    setExtracted(true)
    nav(`/cloud/${cloud}`)
  }

  useEffect(() => {
    setSelectionBlobs([])
  }, [activeSelect])

  function updateSelections(e, cloud) {
    fetch(`${vidServer}/${cloud}`)
    .then(res => res.blob())
    .then(blob => {

      const url = URL.createObjectURL(blob)
      const classList = Array.from(e.target.classList)

      if (classList.includes('selected-vid-blob')){
        setSelectionBlobs(prev => prev.filter(info => info.cloud !== cloud))
    } else if (!classList.includes('selected-vid-blob')) {
        setSelectionBlobs(prev => prev.concat({'cloud': cloud, 'blob': url})) 
      }
  })  

  }

 function downloadMultipleBlobs(e) {
  Array.from(e.target.children).forEach(b => b.click())
  setSelectionBlobs([])
 }

  return (
    <div className='container'> 
      <div className='view-refresh'>
{ 
    logs?.length === 0 ?

    <div> 
      <span> You haven't captured any clouds yet, but hey, that's a good thing right?</span>
    </div>

    :
    <>
      <div className='library-stage'>
      <div className='select-flex'>
        <button onClick={() => setActiveSelect(prev => !prev)} className='select-blobs'></button>
        <button className='download-blobs' onClick={(e) => downloadMultipleBlobs(e)}>
          Download Selection

          { 
            selectionBlobs?.length > 0 && selectionBlobs.map((info, i) => (
              <a href={info['blob']} 
              className={`anchor-blob`} 
              download={info['cloud']}
              key={i}
              target='_blank'>Load</a>
            ))
          }
        </button>
      </div>
        <div className='library-shelf'>
        {
          logs?.map((cap, i ) => (
          cap.written.length > 2 && i > 0 && logs[i + 1].written.length > 2 ?  
          <div className='library-shelf' key={i}>
            
{         cap.written?.map((cloud, j) => (

            <div className='library-item' key={j}>
              <video 
              src = {vidServer + cloud}
              placeholder='placeholder.png'
              onClick={activeSelect ? (e) => updateSelections(e, cloud) : () => watchCloud(cloud.split('/').at(-1))}
              className={`${selectionBlobs.some(selections => selections.cloud === cloud) ? 'selected-vid-blob ' : ''}` + 'video-thumbnail'}
              
              >
              </video>  
              <div className='item-pad'></div>
            </div>
))
}
          </div>
          :
        cap.written?.map((cloud, j) => (
      <div className='library-item' key={j}>
        <video 
        src = {vidServer + cloud}
        placeholder='placeholder.png'
        className={`${selectionBlobs.some(selections => selections.cloud === cloud) ? 'selected-vid-blob ' : ''} video-thumbnail`}
        onClick={activeSelect ? (e) => updateSelections(e, cloud) : () => watchCloud(cloud.split('/').at(-1))} 
        > 
        </video>
        <div className='item-pad'></div>
      </div>
))

))

}
    </div> 
    </div>
  </>
}
      </div>
      
    </div>
  )
}