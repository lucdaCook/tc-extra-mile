// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryRouter
} from 'react-router-dom'
import CredentialsContextProvider from './contexts/CredentialsContext';
import CloudsContextProvider from './contexts/CloudsContext';

export const renderWithRouter = (path, element, options) => {
  const router = createMemoryRouter([{path: path, element: element}], {
  })

  return render( 
  <CredentialsContextProvider>
  <CloudsContextProvider >
      <RouterProvider router={router} />
    </CloudsContextProvider>
  </CredentialsContextProvider>, {...options})
}