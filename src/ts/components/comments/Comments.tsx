import type { JSX } from 'react';
export default function Comments(): JSX.Element {
  return (
    <section className="comments">
      <h3>Comments</h3>
      <button
        type="button"
        className="show-hide"
        aria-expanded="false"
        aria-controls="comment-wrapper"
      >
        Show comments
      </button>

      <div className="comment-wrapper" id="comment-wrapper">
        <h4>Add comment</h4>
        <form className="comment-form">
          <div className="flex-pair">
            <label htmlFor="name">Your name:</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="flex-pair">
            <label htmlFor="comment">Your comment:</label>
            <input
              type="text"
              name="comment"
              id="comment"
              placeholder="Enter your comment"
              required
            />
          </div>
          <div>
            <input type="submit" value="Submit comment" />
          </div>
        </form>

        <h4>Existing comments</h4>
        <ul className="comment-container">
          <li>
            <p>Bob Fossil</p>
            <p>
              Oh I am so glad you taught me all about the big brown angry
              guys...
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
