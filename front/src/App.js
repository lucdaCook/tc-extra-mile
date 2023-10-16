import { Outlet, useLoaderData, } from 'react-router-dom';
import './App.css';
import MainView from './components/MainView';
import Topbar from './components/Topbar';
import CloudsContextProvider from './contexts/CloudsContext';

function Root() {

  const ytCode = useLoaderData()

  return (
    <div className='_Root'>
          <div className='root main-grid'>
            {/* <CredentialsContextProvider defaultYtCode={ytCode}> */}
            <CloudsContextProvider>
                <Topbar>
                </Topbar>
                <MainView>
                </MainView>
                <div 
                className='outlet-refresh'>
                  <Outlet />
                </div>
              </CloudsContextProvider>
            {/* </CredentialsContextProvider> */}
          </div>
        </div>
  );
}

export default Root; 
