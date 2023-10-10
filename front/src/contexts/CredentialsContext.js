import { useState, createContext } from 'react'

export const CredentialsContext = createContext()


export default function CredentialsContextProvider({ children }) {

  const [ user, setUser ] = useState({})
  const [ loggedIn, setLoggedIn ] = useState(false)

  const login = () => {
    fetch('http://localhost:8000/authorize')
    .then(res => console.log(res))
  }

  const values = {
    user,
    login,
    setUser,
  }

  return (
    <CredentialsContext.Provider value={values}>
        { children }
    </CredentialsContext.Provider>
  )

}