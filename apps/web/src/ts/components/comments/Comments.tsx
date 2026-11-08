import { useEffect, useState, type JSX } from 'react';
import {
  addComment,
  deleteComment,
  loadComments,
  type Comment,
} from '../../api/comments';
import Highlight from '../search/Highlight';

interface CommentsProps {
  query: string;
  bearId: string;
}

export default function Comments({
  query,
  bearId,
}: CommentsProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');
  const canSubmit = name.trim() !== '' && comment.trim() !== '';

  useEffect(() => {
    const controller = new AbortController();

    async function fetchComments(): Promise<void> {
      try {
        const data = await loadComments(bearId, controller.signal);
        if (!controller.signal.aborted) setComments(data);
      } catch {
        if (!controller.signal.aborted) setError('Could not load comments.');
      }
    }

    void fetchComments();
    return () => {
      controller.abort();
    };
  }, [bearId]);

  async function handleSubmit(): Promise<void> {
    try {
      const saved = await addComment(bearId, name.trim(), comment.trim());
      setComments((previous) => [...previous, saved]);
      setName('');
      setComment('');
      setError('');
    } catch {
      setError('Could not save comment.');
    }
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      await deleteComment(id);
      setComments((previous) => previous.filter((entry) => entry.id !== id));
      setError('');
    } catch {
      setError('Could not delete comment.');
    }
  }

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

            if (!canSubmit) {
              setError('Please enter your name and a comment.');
              return;
            }

            void handleSubmit();
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
              maxLength={80}
              onChange={(event) => {
                setName(event.target.value);
              }}
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
              maxLength={2000}
              onChange={(event) => {
                setComment(event.target.value);
              }}
            />
          </div>
          <div>
            <input type="submit" value="Submit comment" />
          </div>
        </form>

        {error !== '' && (
          <p role="alert" className="comment-error">
            {error}
          </p>
        )}
        <h4>
          <Highlight query={query}>Existing comments</Highlight>
        </h4>
        <ul className="comment-container">
          {comments.map((entry) => (
            <li key={entry.id}>
              <p>
                <Highlight query={query}>{entry.author}</Highlight>
              </p>
              <p>
                <Highlight query={query}>{entry.text}</Highlight>
              </p>
              <button
                type="button"
                onClick={() => {
                  void handleDelete(entry.id);
                }}
                aria-label={`Delete comment by ${entry.author}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
