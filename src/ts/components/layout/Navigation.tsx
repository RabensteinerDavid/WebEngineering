import type { JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Search from '../search/Search';

const links = ['Our team', 'Projects', 'Blog'];

interface NavigationProps {
  query: string;
  onSearch: (query: string) => void;
}

export default function Navigation({
  query,
  onSearch,
}: NavigationProps): JSX.Element {
  const { search } = useLocation();
  return (
    <nav className="nav">
      <ul>
        <li>
          <Link to={`/bears${search}`}>Home</Link>
        </li>
        {links.map((link) => (
          <li key={link}>
            <a href="#">{link}</a>
          </li>
        ))}
      </ul>
      <Search key={query} initialQuery={query} onSearch={onSearch} />
    </nav>
  );
}
