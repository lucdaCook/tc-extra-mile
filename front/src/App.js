import { Outlet, useLoaderData } from 'react-router-dom';
import './App.css';
import MainView from './components/MainView';
import Topbar from './components/Topbar';
import  { CredentialsContext } from './contexts/CredentialsContext'
import { useContext, useEffect } from 'react';

function Root() {
  return (
    <div className='_Root'>
          <div className='root main-grid'>
            <Topbar>
            </Topbar>
            <MainView>
            </MainView>
            <div 
              className='outlet-refresh'>
              <Outlet />
            </div>
          </div>
        </div>
  );
}

export default Root; 
