import { useContext, useState, useEffect } from 'react'
import { CloudsContext } from '../contexts/CloudsContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { CloudDownload, CloudLock, CloudUnlock } from '../svg/clouds'

export default function Library() {

  const { setExtracted } = useContext(CloudsContext)
  const vidServer = `${process.env.REACT_APP_SERVER}/model/`
  const nav = useNavigate()
  const locState = useLocation().state
  const [ activeSelect, setActiveSelect ] = useState(false)
  const [ selectionBlobs, setSelectionBlobs ] = useState([])

  let logs = JSON.parse(localStorage.getItem('logs'))

  if(logs === null){
    logs = []
  }

  let justCaptured;

  if (locState !== null && locState.justCaptured) {
    justCaptured = Array(locState.justCaptured).fill(locState.justCaptured)
  }

  function watchCloud(cloud) {
    setExtracted(true)
    nav(`/cloud/${cloud}`, {state: {'from': '/library'}})
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
      {
      justCaptured?.map((num, i) => (
        <div className={`just-captured`}
        style={{left: Math.random() * (90 - 20) + 20 + '%', top: Math.random() * (80-20) + 20 + '%'}}
        key={i}
        >
          {`+${num}`}
          </div>
      ))
    }
      <div className='library-stage'>
      <div className='select-flex'>
        <button onClick={() => setActiveSelect(prev => !prev)} 
        className='select-blobs' title='Toggle download selection'>
         { !activeSelect ? <CloudLock /> : <CloudUnlock /> }
        </button>

{ activeSelect && 
          <>
          <CloudDownload />
          <button className='download-blobs' onClick={(e) => downloadMultipleBlobs(e)}>

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
        </>

        }
      </div>
   
      <div className='library-shelves'>
      {
          logs?.map(cap => (


            cap.written?.map((cloud, i) => (
              <div className='library-item' key={i}>
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


          ))
        }

      </div>
      <div className='shelves-padding'></div>
    </div>
  </>
}
      </div>
      
    </div>
  )
}






















// <div className='library-shelf'>
// {
//   logs?.map((cap, i ) => (
//   cap.written.length > 2 && i > 0 && logs[i + 1].written.length > 2 ? 
//   <div className='library-shelf' key={i}>
    
// {         cap.written?.map((cloud, j) => (

//     <div className='library-item' key={j}>
//       <video 
//       src = {vidServer + cloud}
//       placeholder='placeholder.png'
//       onClick={activeSelect ? (e) => updateSelections(e, cloud) : () => watchCloud(cloud.split('/').at(-1))}
//       className={`${selectionBlobs.some(selections => selections.cloud === cloud) ? 'selected-vid-blob ' : ''}` + 'video-thumbnail'}
      
//       >
//       </video>  
//       <div className='item-pad'></div>
//     </div>
// ))
// }
//   </div>
//   :
// cap.written?.map((cloud, j) => (
// <div className='library-item' key={j}>
// <video 
// src = {vidServer + cloud}
// placeholder='placeholder.png'
// className={`${selectionBlobs.some(selections => selections.cloud === cloud) ? 'selected-vid-blob ' : ''} video-thumbnail`}
// onClick={activeSelect ? (e) => updateSelections(e, cloud) : () => watchCloud(cloud.split('/').at(-1))} 
// > 
// </video>
// <div className='item-pad'></div>
// </div>
// ))

// ))

// }
// </div> 