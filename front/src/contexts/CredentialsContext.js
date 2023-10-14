import { useState, createContext } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const CredentialsContext = createContext()


export default function CredentialsContextProvider({ defaultYtCode, children }) {

  const [ youtube, setYoutube ] = useState(defaultYtCode)

  const [ sp, setSp ] = useSearchParams()

  const values = {
    youtube,
    setYoutube
  }

  return (
    <CredentialsContext.Provider value={values}>
        { children }
    </CredentialsContext.Provider>
  )

}