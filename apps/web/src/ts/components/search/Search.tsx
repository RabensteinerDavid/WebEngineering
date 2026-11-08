import { useState, type JSX } from 'react';

interface SearchProps {
  initialQuery: string;
  onSearch: (query: string) => void;
}

export default function Search({
  initialQuery,
  onSearch,
}: SearchProps): JSX.Element {
  const [query, setQuery] = useState(initialQuery);

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
