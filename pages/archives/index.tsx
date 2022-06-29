import Link from 'next/link';
import { sanityClient } from '../../sanity';
import { Slug } from '../../typings';

interface Props {
  pageInfo: { title: string, slug: Slug }[]
}

export default function Archives(props: Props) {
  return <>
    <h1>This is the archives page</h1>
    {props.pageInfo.map((item) => {
      return <>
        <Link key={`${item.slug.current}-link`} href={`/archives/${item.slug.current}`} passHref>
          <a className='text-2xl text-blue-500 underline' key={`${item.slug.current}-a`}>{item.title}</a>
        </Link>
      </>;
    })}
  </>;
}

export const getServerSideProps = async () => {
  const query = `
  *[_type == "archives"] {
    title,
    slug,
  }
  `;
  const results: { title: string, slug: string }[] = await sanityClient.fetch(query);
  return {
    props: {
      pageInfo: results,
    }
  };
};