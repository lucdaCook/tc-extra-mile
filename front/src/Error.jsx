import { Link, useLocation } from "react-router-dom";
import { RainyCloud } from "./svg/clouds";
import MainView from './components/MainView'
export default function ErrorPage({ notFound }) {

  const state = useLocation().state

  console.log(notFound)
  
  return (
    <>
    {/* <MainView />  This here is optional*/}
      <div className="error">
        { notFound ? 
        <>
          <div className="not-found clouds" >
              <RainyCloud />
              <RainyCloud />
              <RainyCloud />
          </div>
          <div className="info">
          <span>Was that a typo?</span>
          <Link to='/'>Go back to home</Link>
          </div>
        </>
        :
        <>
          <RainyCloud />
          <div className="info">
            <span>Oops...That didn't work for some reason.</span>
            <Link to={state?.goTo? state.goTo : state?.from ? state.from : '/'} state={{'from': '/'}}>{state?.message ? state.message : 'Maybe try again?'}</Link>
          </div>
        </>
      }
      </div>
    </>
  )
}
