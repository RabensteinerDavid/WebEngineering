import type { JSX } from 'react';
import Search from '../search/Search';

const links = ['Home', 'Our team', 'Projects', 'Blog'];

interface NavigationProps {
  onSearch: (query: string) => void;
}

export default function Navigation({ onSearch }: NavigationProps): JSX.Element {
  return (
    <nav className="nav">
      <ul>
        {links.map((link) => (
          <li key={link}>
            <a href="#">{link}</a>
          </li>
        ))}
      </ul>
      <Search onSearch={onSearch} />
    </nav>
  );
}
