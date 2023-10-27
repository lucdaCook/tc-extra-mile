import { Link, useLocation } from "react-router-dom";
export default function ErrorPage({ notFound }) {

  const state = useLocation().state

  console.log(notFound)
  
  return (
      <div className="error" style={{position: notFound ? '100vh' : '100%'}}>
        <div className="info">
          <span>Oops...That didn't work for some reason.</span>
          <Link to={state?.goTo? state.goTo : state?.from ? state.from : '/'} state={{'from': '/'}}>{state?.message ? state.message : 'Maybe try again?'}</Link>
        </div>
      </div>
  )
}
