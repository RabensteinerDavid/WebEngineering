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

export default function BearTypeTable(): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Bear Type</th>
          <th scope="col">Coat</th>
          <th scope="col">Adult size</th>
          <th scope="col">Habitat</th>
          <th scope="col">Lifespan</th>
          <th scope="col">Diet</th>
        </tr>
      </thead>
      <tbody>
        {bearTypes.map((bear) => (
          <tr key={bear.type}>
            <td>{bear.type}</td>
            <td>{bear.coat}</td>
            <td>{bear.adultSize}</td>
            <td>{bear.habitat}</td>
            <td>{bear.lifespan}</td>
            <td>{bear.diet}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
