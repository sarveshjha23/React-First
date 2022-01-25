import { GetStaticProps } from "next";
import Header from "../../Components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typings";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";

interface Props {
  post: Post;
}
interface IformInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

function Post({ post }: Props) {
  console.log(post);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IformInput>();

  const onSubmit: SubmitHandler<IformInput> = async (data) => {
    fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        setSubmitted(true);
      })
      .catch((err) => {
        setSubmitted(false);
      });
  };

  return (
    <main>
      <Header />
      <img
        className="w-full h-48 object-cover"
        src={urlFor(post.mainImage).url()!}
      />
      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-grey-500 mb-2">
          {post.description}
        </h2>

        <div className="flex items-center space-x-2">
          <img
            className="h-10 rounded-full"
            src={urlFor(post.author.image).url()!}
          />
          <p className="font-extralight text-sm">
            Blog post By
            <span className="text-green-500"> {post.author.name}</span> -
            Punlished at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
          />
        </div>
      </article>
      <hr className="max-w-lg my-5 mx-auto border-3 border-yellow-500" />

      {submitted ? (
        <div className="flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold">Thank You For Your response</h3>
          <p>Once it has been approved it will be shown below</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col  p-5 max-w-2xl mx-auto mb-10"
        >
          <h3 className="text-sm text-yellow-500">Enjoyed The article?</h3>
          <h4 className="text-3xl font-bold">Leave a comment</h4>
          <hr className="py-3 mt-2" />

          <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={post._id}
          />

          <label className="block mb-5 ">
            <span className="text-grey-100"> Name</span>
            <input
              {...register("name", { required: true })}
              className="shadow border rounder py-2 px-3 form-input mt-1 block w-full ring-yellow-200 focus:ring"
              placeholder="Sarvesh Jha"
              type="text"
            />
          </label>
          <label className="block mb-5 ">
            <span className="text-grey-700"> Email</span>
            <input
              {...register("email", { required: true })}
              className="shadow border rounder py-2 px-3 form-input mt-1 block w-full ring-yellow-200 focus:ring"
              placeholder="Sarvesh Jha"
              type="text"
            />
          </label>

          <label className="block mb-5 ">
            <span className="text-grey-700"> Comment</span>
            <textarea
              {...register("comment", { required: true })}
              className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-200 focus:ring"
              placeholder="Sarvesh Jha"
              rows={8}
            />
          </label>
          <div className="flex  flex-col  p-5">
            {errors.name && (
              <span className="text-red-500">-The name Field is required</span>
            )}
            {errors.email && (
              <span className="text-red-500">-The Email Field is required</span>
            )}
            {errors.comment && (
              <span className="text-red-500">
                -The Comment Field is required
              </span>
            )}
          </div>
          <input
            type="submit"
            className="shadow bg-yellow-500 hover:bg-yellow:400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"
          />
        </form>
      )}

      <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => {
          return (
            <div key={comment._id}>
              <p>
                <span className="text-yellow-500">{comment.name} </span>:
                {comment.comment}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type=='post']{
    _id,
      slug{current}
    }`;

  const posts = await sanityClient.fetch(query);
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type=='post' && slug.current== $slug  ][0]{
        _id,
         _createdAt,
         title,
         author->{
        name,
        image
    },
    
    'comments':*[_type=="comment" && post._ref==^._id && approved==true],
      description,
       mainImage,
       slug,
       body
    
      }`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });

  if (Object.keys(post).length === 0) {
    return { notFound: true };
  }

  return {
    props: { post },
    revalidate: 60,
  };
};
