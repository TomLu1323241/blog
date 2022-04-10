import { url } from "inspector";
import { GetStaticProps } from "next";
import PortableText from "react-portable-text";
import Header from "../../Components/header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from '../../typings'

interface Props {
  post: Post;
}

export default function PostPage({ post }: Props) {
  return <main>
    <Header />
    {/* Banner */}
    <div className="flex items-center max-w-7xl mx-auto p-5">
      <img
        className="w-full h-96 object-cover"
        src={urlFor(post.mainImage).url()}
      />
    </div>
    {/* Article */}
    <article className="px-10 max-w-7xl mx-auto">
      <h1 className="text-3xl mt-5 mb-3">{post.title}</h1>
      <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>
      <div className="flex items-center gap-2">
        <img className="h-12 w-12 rounded-full" src={urlFor(post.author.image).url()} />
        <p className="font-extralight text-sm">Blog post by <span className="text-green-500">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
      </div>
      <div className="mt-10">
        <PortableText
          dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
          projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
          content={post.body}
          serializers={
            {
              h1: (props: any) => (
                <h1 className="text-2xl font-bold my-5" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="text-xl font-bold my-5" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc"> {children} </li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }
          } />
      </div>
    </article>
  </main>
}

export const getStaticPaths = async () => {
  const query = `
  *[_type == "post"] {
    _id,
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
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      _createdAt,
      title,
      author -> {
        name,
        image
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
    }
  }
  return {
    props: {
      post,
    },
    revalidate: 60,
  };
}