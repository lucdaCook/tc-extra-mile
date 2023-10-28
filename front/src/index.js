import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import routerConf from './routes';
import CredentialsContextProvider from './contexts/CredentialsContext';
import CloudsContextProvider from './contexts/CloudsContext';

console.log(window.innerWidth, window.innerHeight)
const router = createBrowserRouter(routerConf)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
      <CredentialsContextProvider>
        <CloudsContextProvider >
            <RouterProvider router={router} />
          </CloudsContextProvider>
        </CredentialsContextProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
