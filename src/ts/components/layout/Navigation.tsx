import type { JSX } from 'react';
import Search from '../search/Search';

const links = ['Home', 'Our team', 'Projects', 'Blog'];

export default function Navigation(): JSX.Element {
  return (
    <nav className="nav">
      <ul>
        {links.map((link) => (
          <li key={link}>
            <a href="#">{link}</a>
          </li>
        ))}
      </ul>
      <Search />
    </nav>
  );
}
