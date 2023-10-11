import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './App';
import ErrorPage from './Error'
import reportWebVitals from './reportWebVitals';
import Library from './components/Library';
import Window from './components/Window';
import CloudsLoader from './components/CloudsLoader';
import CloudLoader from './components/CloudLoader';
import {
  createBrowserRouter,
  redirect,
  RouterProvider
} from 'react-router-dom'

const router = createBrowserRouter([
  {
    path:'/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [{
      path: 'extract',
      element:<Window many={false}/>,
    }, 
    {
      path: 'extract-many',
      element: <Window many={true}/>,
    },
    {
      path: 'library',
      element: <Library />
    },
    {
      path: 'clouds/:cloudIds',
      element: <CloudsLoader/>,
      loader: ({ params }) => {
        return params.cloudIds
      }
    },
    {
      path: 'cloud/:cloudId',
      element: <CloudLoader />,
      loader: ({ params }) => {
        return params.cloudId
      },
    },
]}
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
