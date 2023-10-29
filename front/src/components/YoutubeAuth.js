
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
      <form action='https://accounts.google.com/o/oauth2/v2/auth'
        ref={formRef}
        >
        <input type='hidden' 
        name='client_id'
        value = '842834258318-m7n07hms83p6edq67s0meoqcoq5a3ar8.apps.googleusercontent.com' />
        <input type='hidden'
        name='redirect_uri'
        value = 'http://localhost:3000/yt/auth' />
        <input type='hidden'
        name='response_type'
        value = 'token' />
        <input type='hidden'
        name='scope'
        value = 'https://www.googleapis.com/auth/youtube.force-ssl' />
        <input type='hidden'
        name='include_granted_scopes'
        value ='true' />
        <input type='hidden'
        name='state'
        value ='pass-through value' />
      </form>
  )
}