import { CloudsContext } from "../contexts/CloudsContext"
import { TataBackground, Trees } from "../svg/clouds"
import SkyView from "./SkyView"
import { useCallback, useContext, useEffect } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import backgroundImage from '../svg/background.png';

function MainView() {

  const { tata, setTata } = useContext(CloudsContext)   

  // useBeforeUnload(() => {
  //   if (tata === true) {
  //     localStorage.setItem('showTata', true)
  //   } else {
  //     localStorage.setItem('showTata', false)
  //   }
  // })

  useBeforeUnload(
    useCallback(() => {
      if (tata === true) {
        localStorage.setItem('showTata', true)
      } else {
        localStorage.setItem('showTata', false)
      }
    }, [tata])
  )

  useEffect(() => {
    if (JSON.parse(localStorage.getItem('showTata')) === true){
      setTata(true)
    } else {
      setTata(false)
    }
  }, [])

  return (
      <main className='main-view'>
             <div style={{ 
                backgroundImage: `url(${backgroundImage})`, 
                backgroundSize: 'cover', 
                backgroundRepeat: 'no-repeat',
                height: '100vh', 
                width: '100vw'     
              }}>    
          <div className='bottom-panel'>
          </div>
        </div>
      </main>
  )
}

export default MainView