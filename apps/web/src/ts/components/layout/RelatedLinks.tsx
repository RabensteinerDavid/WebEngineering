import type { JSX } from 'react';
const links = [
  'The trouble with Bees',
  'The trouble with Otters',
  'The trouble with Penguins',
  'The trouble with Octopi',
  'The trouble with Lemurs',
];

export default function RelatedLinks(): JSX.Element {
  return (
    <aside className="secondary">
      <h2>Related</h2>
      <ul>
        {links.map((link) => (
          <li key={link}>
            <a href="#">{link}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
