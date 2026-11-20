import Account from '../auth/Account';
import type { JSX } from 'react';
export default function Header(): JSX.Element {
  return (
    <header className="header">
      <Account />
      <h1>Welcome to our wildlife website</h1>
    </header>
  );
}
