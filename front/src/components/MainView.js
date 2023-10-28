import { CloudsContext } from "../contexts/CloudsContext"
import { TataBackground, Trees } from "../svg/clouds"
import SkyView from "./SkyView"
import { useCallback, useContext, useEffect } from 'react'
import { useBeforeUnload } from 'react-router-dom'


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
        <div className='background-gradient'>  
            <SkyView>
            </SkyView>
          <div className='bottom-panel'>
          { tata === true ?
            <TataBackground showTata={true}/>
            :
            <Trees showTrees={true}/>
          }
          </div>
        </div>
      </main>
  )
}

export default MainView