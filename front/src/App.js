import { Outlet, ScrollRestoration, useLoaderData, useNavigation } from 'react-router-dom';
import './App.css';
import MainView from './components/MainView';
import Topbar from './components/Topbar';
import CredentialsContextProvider from './contexts/CredentialsContext';
import CloudsContextProvider from './contexts/CloudsContext';
import { useEffect } from 'react';

function Root() {

  const ytCode = useLoaderData()

  return (
    <div className='_Root'>
          <div className='root main-grid'>
            <CredentialsContextProvider defaultYtCode={ytCode}>
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
            </CredentialsContextProvider>
          </div>
          <ScrollRestoration />
        </div>
  );
}

export default Root; 
