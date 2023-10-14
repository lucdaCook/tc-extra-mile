import { createContext, useEffect, useState } from 'react'

export const CloudsContext = createContext()

export default function CloudsContextProvider({ children }) {

  const server = process.env.REACT_APP_SERVER + '/model'

  let defaultTata = JSON.parse(localStorage.getItem('showTata'))
  let defaultCloudCount = JSON.parse(localStorage.getItem('cloudCount'))
  
  if (defaultTata == null) {
    defaultTata = true
  }

  if (defaultCloudCount === null) {
    defaultCloudCount = 0
  }

  const [ logs, setLogs ] = useState([])
  const [ extracted, setExtracted ] = useState(false)
  const [ tata, setTata ] = useState(defaultTata) 
  const [ cloudCount, setCloudCount ] = useState(defaultCloudCount)
  
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
      
      let totalCaps = 0
      json.map(cap => {
        totalCaps += cap.n_captured
      })

      if (totalCaps > 0) {

      setLogs(prev => prev.concat(json.sort((a, b) => b.n_captured - a.n_captured)))

      console.log(json)

      setExtracted(true)

      nav('/library', {'justCaptured': totalCaps})

      const vidsWithClouds = json.filter(cap => cap.captured === true).length


      localStorage.setItem('cloudCount', 
      JSON.parse(localStorage.getItem('cloudCount')) + vidsWithClouds)

      } else {
        
      setTata(false)

      localStorage.setItem('neg-clouds',
      JSON.parse(localStorage.getItem('neg-clouds')) + files.length)


      localStorage.setItem('showTata', false)

      nav('/no-clouds')

  }})
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

      if (json.n_captured > 0) {

      setTata(true) 

      setLogs(prev => prev.concat(json))

      setExtracted(true)

      localStorage.setItem('cloudCount', 
      JSON.parse(localStorage.getItem('cloudCount')) + 1)

      nav(`/clouds/${logs.length}`)

      } else {

        setTata(false)

        localStorage.setItem('neg-clouds',
        JSON.parse(localStorage.getItem('neg-clouds')) + 1)


        localStorage.setItem('showTata', false)

        nav('/no-clouds')
      }
    })
  }

  useEffect(() => {
    localStorage.setItem('logs', JSON.stringify(logs.sort((a, b) => b.n_captured - a.n_captured)))
  }, [logs])

  useEffect(() => {

    if (tata === true){
      localStorage.setItem('showTata', true)
    } else if (tata === false) {
      localStorage.setItem('showTata', false)
    }

  }, [tata])

  useEffect(() => {
    localStorage.setItem('cloudCount', cloudCount)
  }, [cloudCount])
 
  const values = {
    logs,
    extracted,
    tata,
    setTata,
    setCloudCount,
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