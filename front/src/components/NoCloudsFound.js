
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function NoCloudsFound() {

  const nav = useNavigate()

  useEffect(() => {
    if (JSON.parse(localStorage.getItem('showTata')) === true) {
      nav('/')
    }
  }, [])

  return (
    <div className="container">
      <div className="no-clouds">
      No Clouds Were Found! That means our work is paying off!
      </div>
    </div>
  )
}