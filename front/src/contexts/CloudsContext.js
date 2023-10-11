import { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const CloudsContext = createContext()

export default function CloudsContextProvider({ children }) {

  const server = process.env.REACT_APP_SERVER + '/model'

  const [ logs, setLogs ] = useState([])
  const [ extracted, setExtracted ] = useState(false)
  
  let defaultConfig = JSON.parse(localStorage.getItem('Config'))

  if (defaultConfig === null || defaultConfig === undefined) {
    defaultConfig = {
      'model': 'Confident',
      'threshold': '0.5',
      'n_frames': '8'
    }
  }


  const [ userConfig, setUserConfig ] = useState({
      'model': defaultConfig['model'], 
      'threshold': defaultConfig['threshold'],
      'n_frames': defaultConfig['n_frames']
  })

  function updateConfig(e) {
    setUserConfig({
      ...userConfig,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {

    localStorage.setItem('Config', JSON.stringify(userConfig))

  }, [userConfig])
  
  function predictOnManyVideos(e, nav) {
    
    e.preventDefault()
   const files = [...e.target.files]
    const formData = new FormData()
    files.forEach(f => {
      formData.append(`file[]`, f)
    });


    formData.append('model', userConfig['model'])
    formData.append('threshold', userConfig['threshold'])
    formData.append('n_frames', userConfig['n_frames'])

    fetch(`${server}/extract-many/`,{ 
    method:'POST',
    body: formData
  }
    ).then(res => res.json())
    .then(json => {

      setLogs(prev => prev.concat(json))

      console.log(json)

      setExtracted(true)

      nav('/library')
    })
  }

  function predictOnVideo(e, nav) {

    e.preventDefault()

    const formData = new FormData()

    const file = e.target.files[0]

    formData.append('file', file)
    formData.append('filename', file.name)

    formData.append('model', userConfig['model'])
    formData.append('threshold', userConfig['threshold'])
    formData.append('n_frames', userConfig['n_frames'])





    fetch(`${server}/extract/`, {
      method: 'POST', 
      body: formData,
      }).then(res => res.json())
    .then(json => {
      setLogs(prev => prev.concat(json))
      setExtracted(true)
      nav(`/clouds/${logs.length}`)
    })
  }
 
  const values = {
    logs,
    extracted,
    setLogs,
    setUserConfig,
    setExtracted,
    predictOnVideo,
    predictOnManyVideos,
    updateConfig
  }

  return (
    <CloudsContext.Provider value={values}>
      { children }
    </CloudsContext.Provider>
  )

}