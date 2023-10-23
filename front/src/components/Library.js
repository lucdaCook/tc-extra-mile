import { useContext, useState, useEffect } from 'react'
import { CloudsContext } from '../contexts/CloudsContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { CloudDownload, CloudLock, CloudUnlock, DeleteIcon } from '../svg/clouds'

export default function Library() {

  const { setExtracted } = useContext(CloudsContext)
  const vidServer = `${process.env.REACT_APP_SERVER}/model/`
  const nav = useNavigate()
  const locState = useLocation().state
  const [ activeSelect, setActiveSelect ] = useState(false)
  const [ selectionBlobs, setSelectionBlobs ] = useState([])
  const [ logs, setLogs ] = useState(JSON.parse(localStorage.getItem('logs')))

  if(logs === null){
    setLogs([])
  }

  let justCaptured;

  if(locState !== null && locState.justCaptured) {
      justCaptured = Array(locState.justCaptured).fill(locState.justCaptured)
  }


  function watchCloud(cloud, info) {
    setExtracted(true)
    nav(`/cloud/${cloud}`, {state: {'from': '/library', 'cloudInfo': info}})
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

 function deleteClips(logs, selections) {

  const  toDelete = selections.map(cloud => cloud.cloud)
  console.log(toDelete)
  const ret = logs.map(l => {
    const prev = {...l}
    prev.written = prev.written?.filter(j => !toDelete.includes(j))

    return prev
  })

  setLogs(ret)

  setLogs(prev => {
    return prev.filter(pre => {
      return pre.written?.length > 0
    })
  })
  setSelectionBlobs([])

}

useEffect(() => {
  localStorage.setItem('logs', JSON.stringify(logs))
}, [logs])

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
          <button className='delete-clip'
            onClick={() => deleteClips(logs, selectionBlobs)}
          >
          <DeleteIcon />
          </button>
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
                onClick={activeSelect ? (e) => updateSelections(e, cloud) : () => watchCloud(cloud.split('/').at(-1), cap)}
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