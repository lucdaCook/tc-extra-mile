import { useContext, useEffect, useState } from 'react'
import { CloudsContext } from '../contexts/CloudsContext'
import { useNavigate } from 'react-router-dom'

export default function Library() {

  const { logs, setExtracted } = useContext(CloudsContext)
  console.log(logs)
  const vidServer = `${process.env.REACT_APP_SERVER}/model/`
  const nav = useNavigate()

  let numWritten = 0

  logs.map(log => {
    numWritten += log.written.length
  })

  function watchCloud(cloud) {
    setExtracted(true)
    nav(`/cloud/${cloud}`)
  }


  return (
    <div className='container'> 
      <div className='view-refresh'>
        <div className='library-stage'>
          {/* <div className='align-end'> */}
{ 

        logs?.map((cap, i ) => (
          <div className='library-shelf' key={i}>

            
{         cap.written?.map((cloud, j) => (
            <div className={`library-item ${ j === 0 || j % 5 === 0 ? 'align-left' : ''}`} key={j}>
              <video 
              src = {vidServer + cloud}
              placeholder='placeholder.png'
              className='video-thumbnail'
              onClick={() => watchCloud(cloud.split('/').at(-1))}
              
              /> 
              <div className='item-pad'></div>
            </div>
))
}
          </div> 
        ))
}
          {/* </div> */}
        </div>
      </div>
    </div>
  )
}




// {      logs !== undefined && logs.length > 0 &&

//   logs.map((cap, i )=> (
//     i % 5 || i === 0 ?
//     <div className='library-shelf' key={i}>
//       <div className={`library-item ${ i % 5 == 0 ? 'align-left' : ''}`}>
//         <span>{cap.written[i]}</span>
//         <div className='item-pad'></div>
//       </div>
//     </div> 
//     :
//     <div className='library-shelf' key={i}>
//       <div className={`library-item`}>
//         <span>Hi</span>
//         <div className='item-pad'></div>
//       </div>
//     </div>
//   ))
// }