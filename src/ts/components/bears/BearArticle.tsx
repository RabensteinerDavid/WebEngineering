import type { JSX } from 'react';
import type { BearWithImage } from '../../models/bear';
import BearList from './BearList';
import BearTypeTable from './BearTypeTable';

interface BearArticleProps {
  bears: BearWithImage[];
}

export default function BearArticle({ bears }: BearArticleProps): JSX.Element {
  return (
    <>
      <h2>The trouble with Bears</h2>
      <p>By Evan Wild</p>
      <p>
        Tall, lumbering, angry, dangerous. The real live bears of this world are
        proud, independent creatures, self-serving and always on the hunt for
        food.
      </p>

      <h3>Types of bear</h3>
      <BearTypeTable />

      <h3>Habitats and Eating habits</h3>
      <p>
        Wild bears eat a variety of meat, fish, fruit, nuts, and other natually
        growing ingredients...
      </p>
      <img src="/media/wild-bear.jpg" alt="Wild bear in forest" />
      <p>
        Urban (gentrified) bears on the other hand have largely abandoned the
        old ways...
      </p>
      <img src="/media/urban-bear.jpg" alt="Urban bear near buildings" />

      <h3>Mating rituals</h3>
      <p>Bears are romantic creatures by nature...</p>
      <audio controls>
        <source src="/media/bear.mp3" type="audio/mp3" />
        <source src="/media/bear.ogg" type="audio/ogg" />
        <p>It looks like your browser doesn't support HTML5 audio players.</p>
      </audio>

      <aside>
        <h3>About the author</h3>
        <p>Evan Wild is an unemployed plumber from Doncaster...</p>
      </aside>

      <BearList bears={bears} />
    </>
  );
}
