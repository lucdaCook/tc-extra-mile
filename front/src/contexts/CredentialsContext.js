import { useState, createContext } from 'react'

export const CredentialsContext = createContext()


export default function CredentialsContextProvider({ children }) {

  const [ youtube, setYoutube ] = useState('')

  const values = {
    youtube,
    setYoutube,
  }

  return (
    <CredentialsContext.Provider value={values}>
        { children }
    </CredentialsContext.Provider>
  )

}