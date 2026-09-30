import Highlight from '../search/Highlight';
import type { JSX } from 'react';
import BearList from './BearList';
import BearTypeTable from './BearTypeTable';
import Comments from '../comments/Comments';

interface BearArticleProps {
  query: string;
}

export default function BearArticle({ query }: BearArticleProps): JSX.Element {
  return (
    <>
      <h2>
        <Highlight query={query}>The trouble with Bears</Highlight>
      </h2>
      <p>
        <Highlight query={query}>By Evan Wild</Highlight>
      </p>
      <p>
        <Highlight query={query}>
          Tall, lumbering, angry, dangerous. The real live bears of this world
          are proud, independent creatures, self-serving and always on the hunt
          for food.
        </Highlight>
      </p>

      <h3>
        <Highlight query={query}>Types of bear</Highlight>
      </h3>
      <BearTypeTable query={query} />

      <h3>
        <Highlight query={query}>Habitats and Eating habits</Highlight>
      </h3>
      <p>
        <Highlight query={query}>
          Wild bears eat a variety of meat, fish, fruit, nuts, and other
          natually growing ingredients...
        </Highlight>
      </p>
      <img src="/media/wild-bear.jpg" alt="Wild bear in forest" />
      <p>
        <Highlight query={query}>
          Urban (gentrified) bears on the other hand have largely abandoned the
          old ways...
        </Highlight>
      </p>
      <img src="/media/urban-bear.jpg" alt="Urban bear near buildings" />

      <h3>
        <Highlight query={query}>Mating rituals</Highlight>
      </h3>
      <p>
        <Highlight query={query}>
          Bears are romantic creatures by nature...
        </Highlight>
      </p>
      <audio controls>
        <source src="/media/bear.mp3" type="audio/mp3" />
        <source src="/media/bear.ogg" type="audio/ogg" />
        <p>
          <Highlight query={query}>
            It looks like your browser doesn't support HTML5 audio players.
          </Highlight>
        </p>
      </audio>

      <aside>
        <h3>
          <Highlight query={query}>About the author</Highlight>
        </h3>
        <p>
          <Highlight query={query}>
            Evan Wild is an unemployed plumber from Doncaster...
          </Highlight>
        </p>
      </aside>

      <Comments query={query} />

      <BearList query={query} />
    </>
  );
}
