import Highlight from '../search/Highlight';
import type { JSX } from 'react';
interface BearType {
  type: string;
  coat: string;
  adultSize: string;
  habitat: string;
  lifespan: string;
  diet: string;
}

const bearTypes: BearType[] = [
  {
    type: 'Wild',
    coat: 'Brown or black',
    adultSize: '1.4 to 2.8 meters',
    habitat: 'Woods and forests',
    lifespan: '25 to 28 years',
    diet: 'Fish, meat, plants',
  },
  {
    type: 'Urban',
    coat: 'North Face',
    adultSize: '18 to 22',
    habitat: 'Condos and coffee shops',
    lifespan: '20 to 32 years',
    diet: 'Starbucks, sushi',
  },
];

interface BearTypeTableProps {
  query: string;
}

export default function BearTypeTable({
  query,
}: BearTypeTableProps): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">
            <Highlight query={query}>Bear Type</Highlight>
          </th>
          <th scope="col">
            <Highlight query={query}>Coat</Highlight>
          </th>
          <th scope="col">
            <Highlight query={query}>Adult size</Highlight>
          </th>
          <th scope="col">
            <Highlight query={query}>Habitat</Highlight>
          </th>
          <th scope="col">
            <Highlight query={query}>Lifespan</Highlight>
          </th>
          <th scope="col">
            <Highlight query={query}>Diet</Highlight>
          </th>
        </tr>
      </thead>
      <tbody>
        {bearTypes.map((bear) => (
          <tr key={bear.type}>
            <td>
              <Highlight query={query}>{bear.type}</Highlight>
            </td>
            <td>
              <Highlight query={query}>{bear.coat}</Highlight>
            </td>
            <td>
              <Highlight query={query}>{bear.adultSize}</Highlight>
            </td>
            <td>
              <Highlight query={query}>{bear.habitat}</Highlight>
            </td>
            <td>
              <Highlight query={query}>{bear.lifespan}</Highlight>
            </td>
            <td>
              <Highlight query={query}>{bear.diet}</Highlight>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
