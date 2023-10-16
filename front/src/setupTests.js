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

export const renderWithRouter = (path, element, options) => {
  const router = createMemoryRouter([{path: path, element: element}], {
  })

  return render(<RouterProvider router={router}/>, {...options})
}