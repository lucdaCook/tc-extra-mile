
import { CredentialsContext } from "../contexts/CredentialsContext"
import { useContext, useEffect, useRef } from "react"
import { useLoaderData, useLocation, useNavigate } from "react-router-dom"

export default function YoutubeAuthorizer() {

  const { setYoutube } = useContext(CredentialsContext)

  
  const ytCode = useLoaderData()
  const nav = useNavigate()
  const formRef = useRef()
const loc = useLocation()
  const locState = loc.state

  console.log(ytCode)

  useEffect(() => {
    // if(locState === null) {
    //   locState.from = '/'
    // }
    if (locState !== null && locState.click === 1) {
      nav('/')
    }
  }, [loc])

  useEffect(() => {   
    if (ytCode !== null) {
      setYoutube(ytCode)
      nav(locState?.from ? locState?.from : '/')
    } else {
      try {
        formRef.current.submit()
        if(locState !== null && locState.click === 1) {
          locState.click = 0
        }
      } catch(err) {
        nav('/error', {'message': `That request isn't working right now... ${err.message}`})
      }
    }
  }, [ytCode])

  return (
      <form action={process.env.REACT_APP_AUTH_URI}
        ref={formRef}
        >
        <input type='hidden' 
        name='client_id'
        value = {process.env.REACT_APP_CLIENT_ID} />
        <input type='hidden'
        name='redirect_uri'
        value = {process.env.REACT_APP_REDIRECT_URI} />
        <input type='hidden'
        name='response_type'
        value = 'token' />
        <input type='hidden'
        name='scope'
        value = {process.env.REACT_APP_SCOPE} />
        <input type='hidden'
        name='include_granted_scopes'
        value ='true' />
        <input type='hidden'
        name='state'
        value ='pass-through value' />
      </form>
  )
}