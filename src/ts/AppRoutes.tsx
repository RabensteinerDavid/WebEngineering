import type { JSX } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import BearArticle from './components/bears/BearArticle';
import BearDetail from './components/bears/BearDetail';

interface AppRoutesProps {
  query: string;
}

export default function AppRoutes({ query }: AppRoutesProps): JSX.Element {
  const { search } = useLocation();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={{ pathname: '/bears', search }} replace />}
      />
      <Route path="/bears" element={<BearArticle query={query} />} />
      <Route path="/bears/:bearId" element={<BearDetail query={query} />} />
      <Route
        path="*"
        element={
          <>
            <h2>Page not found</h2>
            <Link to="/bears">Back to bears</Link>
          </>
        }
      />
    </Routes>
  );
}
