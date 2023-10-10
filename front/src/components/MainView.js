import Background from "./Background"
import SkyView from "./SkyView"


function MainView() {

  return (
      <main className='main-view'>
        <div className='background-gradient'>
            <SkyView>
            </SkyView>
          <div className='bottom-panel'></div>
        </div>
      </main>
  )
}

export default MainView