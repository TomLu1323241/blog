import { url } from "inspector";
import { GetStaticProps } from "next";
import Header from "../../Components/header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from '../../typings'

interface Props {
  post: Post;
}

export default function PostPage({ post }: Props) {
  console.log(post);
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
    <article className="px-10">
      <h1 className="text-3xl mt-5 mb-3">{post.title}</h1>
      <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>
      <div className="flex items-center gap-2">
        <img className="h-12 w-12 rounded-full" src={urlFor(post.author.image).url()} />
        <p className="font-extralight text-sm">Blog post by <span className="text-green-500">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
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