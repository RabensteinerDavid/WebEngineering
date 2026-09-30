import type { JSX } from 'react';
export default function Search(): JSX.Element {
  return (
    <form className="search">
      <label htmlFor="search-input">Search:</label>
      <input
        type="search"
        id="search-input"
        name="q"
        placeholder="Search query"
      />
      <input type="submit" value="Go!" />
    </form>
  );
}
