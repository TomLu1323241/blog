import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/header';
import { sanityClient, urlFor } from '../sanity';
import { Post } from '../typings';


interface Props {
  posts: Post[];
}

export default function Home({ posts }: Props) {
  return (
    <div className='max-w-7xl mx-auto'>
      <Head>
        <title>Tom's Blog</title>
        <link rel='icon' href='/logo.png' />
        <meta property='og:title' content="Welcome to Tom's blog" />
        <meta property='og:image' content='/T.png' />
        <meta property='og:description' content='Some details about the awesome Tom!!!' />
      </Head>
      <Header />

      {/* Banner */}
      <div className='flex justify-between items-center bg-yellow-400 border-y border-black py-10 lg:py-0'>
        <div className='px-10 space-y-5'>
          <h1 className='text-6xl max-w-xl font-serif'>
            Welcome to <span className='underline decoration-4'>Tom</span>'s blog
          </h1>
          <h2>
            Some details about the awesome Tom!!!
          </h2>
        </div>
        <img
          className='hidden md:inline-flex h-52 lg:h-96 pr-5'
          src='/T.png'
          alt=''
        />
      </div>

      {/* Posts */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gpa-6 p-2 md:p-6'>
        {posts.map(post => {
          return (
            <Link key={post._id} href={`/post/${post.slug.current}`}>
              <a className='h-full'>
                <div className='group cursor-pointer border rounded-lg overflow-hidden shadow-lg h-full'>
                  <div className='h-60 w-full relative'>
                    <Image className='object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out' src={urlFor(post.mainImage).url()!} layout='fill' />
                  </div>
                  <div className='flex justify-between p-5 bg-white'>
                    <div className='basis-5/6'>
                      <p className='text-lg font-bold'>{post.title}</p>
                      <p className='text-xs'>{post.description}</p>
                      <p className='text-xs text-gray-400'>{new Date(post._createdAt).toLocaleString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}</p>
                    </div>
                    <Image className='rounded-full' src={urlFor(post.author.image).url()!} height={48} width={48} layout='fixed' objectFit='cover' />
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export const getServerSideProps = async () => {
  const query = `
  *[_type == "post"] | order(_createdAt desc){
    _id,
    _createdAt,
    title,
    author -> {
      name,
      image
    },
    description,
    mainImage,
    slug
  }
  `;
  const posts: Post[] = await sanityClient.fetch(query);
  return {
    props: {
      posts,
    }
  };
};