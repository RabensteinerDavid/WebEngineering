import Highlight from '../search/Highlight';
import { useState, type JSX } from 'react';
interface CommentsProps {
  query: string;
}

export default function Comments({ query }: CommentsProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'initial',
      name: 'Bob Fossil',
      text: 'Oh I am so glad you taught me all about the big brown angry guys...',
    },
  ]);
  const canSubmit = name.trim() !== '' && comment.trim() !== '';

  return (
    <section className="comments">
      <h3>
        <Highlight query={query}>Comments</Highlight>
      </h3>
      <button
        type="button"
        className="show-hide"
        aria-expanded={isVisible}
        onClick={() => {
          setIsVisible((visible) => !visible);
        }}
        aria-controls="comment-wrapper"
      >
        <Highlight query={query}>
          {isVisible ? 'Hide comments' : 'Show comments'}
        </Highlight>
      </button>

      <div className="comment-wrapper" id="comment-wrapper" hidden={!isVisible}>
        <h4>
          <Highlight query={query}>Add comment</Highlight>
        </h4>
        <form
          className="comment-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit) return;
            const newComment = {
              id: crypto.randomUUID(),
              name: name.trim(),
              text: comment.trim(),
            };
            setComments((previous) => [...previous, newComment]);
            setName('');
            setComment('');
          }}
        >
          <div className="flex-pair">
            <label htmlFor="name">
              <Highlight query={query}>Your name:</Highlight>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
              required
            />
          </div>
          <div className="flex-pair">
            <label htmlFor="comment">
              <Highlight query={query}>Your comment:</Highlight>
            </label>
            <input
              type="text"
              name="comment"
              id="comment"
              placeholder="Enter your comment"
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
              }}
              required
            />
          </div>
          <div>
            <input type="submit" value="Submit comment" disabled={!canSubmit} />
          </div>
        </form>

        <h4>
          <Highlight query={query}>Existing comments</Highlight>
        </h4>
        <ul className="comment-container">
          {comments.map((entry) => (
            <li key={entry.id}>
              <p>
                <Highlight query={query}>{entry.name}</Highlight>
              </p>
              <p>
                <Highlight query={query}>{entry.text}</Highlight>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
