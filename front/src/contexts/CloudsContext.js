import { createContext, useEffect, useState } from 'react'

export const CloudsContext = createContext()

export default function CloudsContextProvider({ children }) {

  const server = process.env.REACT_APP_SERVER + '/model'

  let defaultTata = JSON.parse(localStorage.getItem('showTata'))
  let defaultCloudCount = JSON.parse(localStorage.getItem('cloudCount'))

  const storedLogs = JSON.parse(localStorage.getItem('logs'))
  
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
    ).then(res => {
      if(res.ok){
        return res.json()
      } else {
        throw res
      }
    })
    .then(json => {
      let aborted = false

      if (json.at(-1).status === 205) {
        aborted = true
        json = json.slice(0, json.length - 1)
      }

      let totalCaps = 0
      json.map(cap => {
        totalCaps += cap.n_captured
      })

      if (totalCaps > 0) {

      setLogs(prev => prev.concat(json))
      
      if ( storedLogs !== null && storedLogs.length > 0) {
      localStorage.setItem('logs', 
      JSON.stringify(json.concat([...JSON.parse(localStorage.getItem('logs'))])))
      // .sort((a, b) => b.n_captured - a.n_captured)
      } else {
        localStorage.setItem('logs', 
      JSON.stringify(json))
      }

      setExtracted(true)
      setTata(true)
      
      if (!aborted) {
        nav('/library', {state: {'justCaptured': totalCaps}})
      }

      const vidsWithClouds = json.filter(cap => cap.captured === true).length


      localStorage.setItem('cloudCount', 
      JSON.parse(localStorage.getItem('cloudCount')) + vidsWithClouds)

      } else {
        if (json.at(-1).status === 205) { 
          return 
        }
      setTata(false)

      localStorage.setItem('neg-clouds',
      JSON.parse(localStorage.getItem('neg-clouds')) + files.length)


      localStorage.setItem('showTata', false)
      

  }}).catch(err => {
    nav('/error', {state: {'error': err, 'from': '/extract-many'}})
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
    }).then(res => {
      if (res.ok){
        return res.json()
      } else {
        throw res
      }})
    .then(json => {
      
      if (json.n_captured > 0) {
        
        setTata(true) 
        
        setLogs(prev => prev.concat(json))


        if (storedLogs !== null && storedLogs.length > 0) {
          localStorage.setItem('logs', 
          JSON.stringify([json].concat([...JSON.parse(localStorage.getItem('logs'))])))
          } else {
            localStorage.setItem('logs', 
          JSON.stringify([json]))
          }
      setExtracted(true)

      localStorage.setItem('cloudCount', 
      JSON.parse(localStorage.getItem('cloudCount')) + 1)
      
      if (json.status !== 205) {
        nav(`/clouds/${logs.length}`, {state: {'from': '/extract'}})
      }

      } else {
        if (json.status === 205) {
          return
        }

        setTata(false)

        localStorage.setItem('neg-clouds',
        JSON.parse(localStorage.getItem('neg-clouds')) + 1)


        localStorage.setItem('showTata', false)

        nav('/no-clouds', {state: {'backdrop': 'no-clouds'}})
      }
    }).catch((err) => {
      nav('/error', {state: {'error': err, from: '/extract'}})
    })
  }

  async function extractFromLivestream(video, nav) {
    console.log(video)
    
    const formData = new FormData()
    
    formData.append('video', video)
    formData.append('model', userConfig['model'])
    formData.append('threshold', userConfig['threshold'])
    formData.append('n_frames', userConfig['n_frames'])
    
    
    const res = await fetch(`${server}/extract-live`, {
      method: 'POST',
      body: formData,
    })


    if (res.ok) {
      const j = await res.json()
      console.log(j)
      if(j.status === 200){
        setLogs(prev => [j].concat(prev))
        localStorage.setItem('cloudCount', 
        JSON.parse(localStorage.getItem('cloudCount')) + 1)
        setTata(true)
        if (storedLogs !== null && storedLogs.length > 0) {
          localStorage.setItem('logs', 
          JSON.stringify([j].concat([...JSON.parse(localStorage.getItem('logs'))])))
        } else {
          localStorage.setItem('logs', 
          JSON.stringify([j]))
        }
      }
    return j

  } else {
    nav('/error')
  }
    
  }
  
  function submitFeedback(e, numStars, cloudInfo) {
   e.preventDefault()
   console.log(cloudInfo)
   console.log(e.target.children.text.value)
   console.log(numStars)



   // fetch(`${process.env.REACT_APP_SERVER}/model/feedback`, {
   //   method: "POST", 
   //   body: {
   //     'stars': numStars,
   //     // 'text': text
   //   }
   // }).then(res => console.log(res.status))
 }

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
    extractFromLivestream,
    updateConfig,
    submitFeedback,
  }

  return (
    <CloudsContext.Provider value={values}>
      { children }
    </CloudsContext.Provider>
  )

}