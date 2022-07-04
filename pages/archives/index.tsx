import { GetStaticProps } from 'next';
import Link from 'next/link';
import { sanityClient } from '../../shared/sanity';
import { Slug } from '../../shared/typings';

interface Props {
  pageInfo: { title: string, slug: Slug }[]
}

export default function Archives({ pageInfo }: Props) {
  console.log(pageInfo);
  return <>
    <h1>This is the archives page</h1>
    {pageInfo.map((item, index) => {
      return <div key={`${index}-div`}>
        <Link href={`/archives/${item.slug.current}`} passHref>
          <a className='text-2xl text-blue-500 underline' >{item.title}</a>
        </Link>
      </div>;
    })}
  </>;
}

export const getStaticProps: GetStaticProps = async () => {
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
    },
    revalidate: 60,
  };
};