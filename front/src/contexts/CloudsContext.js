import { createContext, useEffect, useState } from 'react'

export const CloudsContext = createContext()

export default function CloudsContextProvider({ children }) {

  const server = 'http://localhost:8000/model/extract/'
  const videos = process.env.REACT_APP_SERVER

  const [ logs, setLogs ] = useState([])
  const [ extracted, setExtracted ] = useState(false)


  function predictOnVideo(e, fetcher) {

    e.preventDefault()

    const formData = new FormData()

    const file = e.target.files[0]

    formData.append('file', file)
    formData.append('filename', file.name)

    fetch(server, {
      method: 'POST',
      body: formData,
      }).then(res => res.json())
    .then(json => {
      setLogs(prev => prev.concat(json))
      setExtracted(true)
      fetcher.load(`/clouds/${logs.length}`)
    })
  }

  useEffect(() => {
    localStorage.setItem('clouds', JSON.stringify(logs))
  }, [logs])

 
  const values = {
    logs,
    extracted,
    setLogs,
    setExtracted,
    predictOnVideo

  }

  return (
    <CloudsContext.Provider value={values}>
      { children }
    </CloudsContext.Provider>
  )

}