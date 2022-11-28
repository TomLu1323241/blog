import { GetStaticProps } from 'next';
import PortableText from 'react-portable-text';
import Header from '../../components/header';
import { sanityClient, urlFor } from '../../shared/sanity';
import { Post } from '../../shared/typings';
import Head from 'next/head';
import Highlight from 'react-highlight';
import 'highlight.js/styles/an-old-hope.css';
import CommentSection from '../../components/commentSection';

interface Props {
  post: Post;
  imageGroupAssets: Record<string, Object>;
}


export default function PostPage({ post, imageGroupAssets }: Props) {

  // Change code blocks
  post.body.forEach((item: any) => {
    if (item?._type === 'code') {
      item._type = 'block';
      let code = item.code;
      let lang = item.language;
      item.children = [
        {
          text: code,
          lang: lang,
        }
      ];
      item.style = 'customCode';
    }
  });
  // Add references to group photos
  post.body.forEach((item: any) => {
    if (item._type == 'reference') {
      item._type = 'block';
      item.children = [
        imageGroupAssets[item._ref]
      ];
      item.style = 'imageGroup';
    }
  });

  return <main className='overflow-clip'>
    <Head>
      <title>{post.title}</title>
      <link rel='icon' href='/logo.png' />
      <meta property='og:title' content={post.title} />
      <meta property='og:image' content={urlFor(post.mainImage).url()} />
      <meta property='og:description' content={post.description} />
    </Head>
    <Header />
    {/* Banner */}
    <div className='flex items-center max-w-7xl mx-auto pb-5'>
      <img
        className='w-full h-96 object-cover'
        src={urlFor(post.mainImage).url()}
      />
    </div>
    {/* Article */}
    <article className='px-5 md:px-10 max-w-7xl mx-auto'>
      <h1 className='text-3xl mt-5 mb-3'>{post.title}</h1>
      <h2 className='text-xl font-light text-gray-500 mb-2 dark:text-gray-400'>{post.description}</h2>
      <div className='flex items-center gap-2'>
        <img className='h-12 w-12 rounded-full object-cover aspect-square' src={urlFor(post.author.image).url()} />
        <p className='font-extralight text-sm'>Blog post by <span className='text-green-500'>{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
      </div>
      <div className='mt-10'>
        <PortableText
          dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
          projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
          content={post.body}
          serializers={
            {
              imageGroup: (props: any) => {
                let imageBody: Object[] = props.children[0].props.node.body;
                return (
                  // <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gpa-6 p-2 md:p-6'>
                  <div className='flex flex-wrap gap-4 md:mx-12'>
                    {imageBody.map((item: any) => {
                      let src: string = '';
                      if (item._type == 'urlObject') {
                        src = item.urlField;
                      } else if (item._type == 'image') {
                        src = urlFor(item.asset).url();
                      }
                      return <img key={item._key} className='max-h-64 mx-auto object-contain hover:scale-125 transition-transform duration-200 ease-in-out' src={src} />;
                    })}
                  </div>
                );
              },
              code: (props: any) => (
                <code className='rounded-md bg-slate-200 text-gray-600' {...props} />
              ),
              customCode: (props: any) => (
                <div className='overflow-x-auto rounded-xl shadow-md border mx-auto max-w-4xl'>
                  <Highlight className={`language-${props.children[0].props.node.lang} min-w-fit`}>
                    {props.children[0].props.node.text}
                  </Highlight>
                </div>
              ),
              normal: (props: any) => (
                <p className='text-base md:text-xl my-1 break-words indent-8' {...props} />
              ),
              h1: (props: any) => (
                <h1 className='text-4xl font-bold my-5' {...props} />
              ),
              h2: (props: any) => (
                <h2 className='text-2xl font-bold my-3' {...props} />
              ),
              h3: (props: any) => (
                <h3 className='text-lg md:text-xl font-bold my-1 text-gray-600 dark:text-gray-400' {...props} />
              ),
              li: ({ children }: any) => (
                <li className='ml-16 list-disc'> {children} </li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className='text-blue-500 hover:underline'>
                  {children}
                </a>
              ),
              image: (props: any) => (
                <img className='w-full max-h-[32rem] object-contain py-5' src={urlFor(props.asset).url()} />
              ),
              blockquote: (props: any) => (
                <div className='max-w-fit md:max-w-4xl md:w-fit mx-auto bg-grey-light rounded-lg shadow-md p-8 border dark:border-gray-600 dark:bg-gray-800 dark:shadow-gray-700'>
                  {props.children[0].lastIndexOf('-') !== -1 && (
                    <>
                      <h2 className='italic text-right text-blue-darkest leading-normal break-words'>
                        {props.children[0].substring(0, props.children[0].lastIndexOf('-'))}
                      </h2>
                      <p className='text-right pt-2 pr-6 text-gray-400'>
                        - {props.children[0].substring(props.children[0].lastIndexOf('-') + 1)}
                      </p>
                    </>
                  )}
                  {props.children[0].lastIndexOf('-') === -1 && (
                    <>
                      <h2 className='italic text-right text-blue-darkest leading-normal break-words'>
                        {props.children[0]}
                      </h2>
                      <p className='text-right pt-2 pr-6 text-gray-400'>
                        - anonymous
                      </p>
                    </>
                  )}
                </div>
              )
            }
          } />
      </div>
    </article>
    <hr className='max-w-2xl my-5 mx-auto border border-yellow-500' />
    <CommentSection comments={post.comment} post_id={post._id} />
  </main>;
}

export const getStaticPaths = async () => {
  const query = `
  *[_type == "post"] {
    _id,
    _createdAt,
    slug {
      current
    }
  }
  `;
  const posts: Post[] = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    }
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `
  *[_type == "post" && 
    slug.current == $slug][0] {
    _id,
    _createdAt,
    title,
    author -> {
      name,
      image
    },
    'comment': *[_type == "comment" &&
                post._ref == ^._id &&
                approved == true] {
                  author,
                  comment,
                },
    description,
    mainImage,
    body,
    slug {
      current
    }
  }
  `;
  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });
  if (!post) {
    return {
      notFound: true,
    };
  }
  let imageGroupsRefs: string[] = [];
  post.body.forEach((item: any) => {
    if (item._type == 'reference') {
      imageGroupsRefs.push(item._ref);
    }
  });
  let imageGroupAssets: Record<string, Object> = {};
  for (let i = 0; i < imageGroupsRefs.length; i++) {
    const imageQuery = `
    *[_type == 'imageGroups' && _id == $ref][0] {
      body
    }
    `;
    const imageGroups = await sanityClient.fetch(imageQuery, {
      ref: imageGroupsRefs[i],
    });
    imageGroupAssets[imageGroupsRefs[i]] = imageGroups;
  }

  return {
    props: {
      post,
      imageGroupAssets,
    },
    revalidate: 60,
  };
};
