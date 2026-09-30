import { useState, type JSX } from 'react';

interface SearchProps {
  onSearch: (query: string) => void;
}

export default function Search({ onSearch }: SearchProps): JSX.Element {
  const [query, setQuery] = useState('');

  return (
    <form
      className="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(query.trim());
      }}
    >
      <label htmlFor="search-input">Search:</label>
      <input
        type="search"
        id="search-input"
        name="q"
        placeholder="Search query"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />
      <input type="submit" value="Go!" />
    </form>
  );
}
