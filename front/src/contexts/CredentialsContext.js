import { useState, createContext } from 'react'

export const CredentialsContext = createContext()


export default function CredentialsContextProvider({ children }) {

  const [ youtube, setYoutube ] = useState('')

  const [ user, setUser ] = useState({})

  
  const login = (user) => {
    // fetch('http://localhost:8000/login')
    console.log(user)
  }
  
  const values = {
    youtube,
    user,
    setUser,
    setYoutube,
    login
  }
  return (
    <CredentialsContext.Provider value={values}>
        { children }
    </CredentialsContext.Provider>
  )

}