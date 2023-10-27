import { useContext, useEffect, useState } from "react";
import { CredentialsContext } from "../contexts/CredentialsContext";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";

export default function Login() {

  const locState = useLocation().state
  const action = useLoaderData()
  const nav = useNavigate()
  const lgRoute = 'http://localhost:8000/login'
  const spRoute = 'http://localhost:8000/signup'
  const [ submit, setSubmit ] = useState(lgRoute)


  useEffect(() => {
    if(action === 'out') {
      console.log('logging out')
      nav(locState.from)
    }

  }, [action])

  // const { user, setUser } = useContext(CredentialsContext)

  const login = (user) => {
    console.log(user)
    // fetch(submit)
  }

  return (
    <div className="view-refresh"
    style={{display: 'block'}}>
      <div className="login" data-testid='login-form'>
        <form
          onSubmit={e => e.preventDefault()}
        >
          <label htmlFor="un">
            Username
            <input type='text' 
            autoComplete="off"
            name="un"/>
          </label>
          <label htmlFor="pw">
            Password
            <input type='password' 
            name="pw"
            autoComplete="off"/>
          </label>
            <button 
              type="submit" 
              className="submit-btn"
              onClick={e => e.target.blur()}
            >
              {submit === lgRoute ? 'Login' : 'Sign up'}
            </button>
            <span 
            style={{position: 'absolute'}}
            onClick={() => setSubmit(prev => prev === lgRoute ? spRoute : lgRoute)}
            >
              {submit === lgRoute ? 'Create an account' : 'Already have an account'}
            </span>
        </form>
      </div>
    </div>
  ) 
}