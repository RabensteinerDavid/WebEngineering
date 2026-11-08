import { Fragment, type JSX } from 'react';

interface HighlightProps {
  children: string;
  query: string;
}

export default function Highlight({
  children,
  query,
}: HighlightProps): JSX.Element {
  if (query === '') {
    return <>{children}</>;
  }

  const escapedQuery = query.replace(/[.*+?^$\[\]\\]/gv, '\\$&');
  const parts = children.split(new RegExp(`(${escapedQuery})`, 'giv'));

  const alternatingParts = 2;
  const matchPosition = 1;

  return (
    <>
      {parts.map((part, index) =>
        index % alternatingParts === matchPosition ? (
          <mark className="highlight" key={index}>
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
}
