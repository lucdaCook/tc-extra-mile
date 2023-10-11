import { Outlet } from 'react-router-dom';
import './App.css';
import MainView from './components/MainView';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CredentialsContextProvider from './contexts/CredentialsContext';
import CloudsContextProvider from './contexts/CloudsContext';

function Root() {

  return (
    <div className='_Root'>
          <div className='root main-grid'>
            <CredentialsContextProvider>
            <CloudsContextProvider>
                <Topbar>
                </Topbar>
                {/* <Sidebar> 
                change grid temp areas to top top sidebar main if we want back
                and undo display none ofc
                </Sidebar>  */}
                <MainView>
                </MainView>
                <div className='outlet-refresh'>
                  <Outlet />
                </div>
              </CloudsContextProvider>
            </CredentialsContextProvider>
          </div>
        </div>
  );
}

export default Root; 
