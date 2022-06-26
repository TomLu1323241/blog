import Link from 'next/link';
import { sanityClient } from '../../sanity';

interface Props {
  titles: string[]
}

export default function Archives({ titles }: Props) {
  return <>
    <h1>This is the archives page</h1>
    {titles.map((item) => {
      return <>
        <Link key={item} href={`/archives/${item}`} passHref>
          <a className='text-2xl text-blue-500 underline' key={item}>{item}</a>
        </Link>
      </>;
    })}
  </>;
}

export const getServerSideProps = async () => {
  const query = `
  *[_type == "archives"] {
    title,
  }
  `;
  const titles: { title: string }[] = await sanityClient.fetch(query);
  const titleArray = titles.map((item) => item.title);
  return {
    props: {
      titles: titleArray,
    }
  };
};