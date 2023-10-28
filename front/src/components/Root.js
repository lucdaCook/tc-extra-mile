import CredentialsContextProvider from "../contexts/CredentialsContext"
import Topbar from "./Topbar"
import Sidebar from "./Sidebar"
import MainView from "./MainView"

export default function Root() {
  return (
    <div className='_Root'>
      <div className='root main-grid'>
        <CredentialsContextProvider>
          <Topbar>
          </Topbar>
          <Sidebar>
          </Sidebar>
          <MainView>
          </MainView>
        </CredentialsContextProvider>
      </div>
  </div>
  )
}