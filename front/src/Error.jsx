import { useRouteError } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function ErrorPage() {

  const err = useLocation().state.errorInfo
  console.log(err, 'THIS THE ERRRRRRRRRRRRRRR')

  return (
    <div className="error">
      ERRRRRRRORRRRR
    </div>
  )
}