export default {
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    {
      name: 'author',
      title: 'Author',
      description: 'Name of the Author',
      type: 'string',
    },
    {
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      description: ' Comments won\'t be shown on the site without approval',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'comment',
      title: 'Comment',
      type: 'string',
    },
    {
      name: 'post',
      type: 'reference',
      to: [{ type: 'post' }],
    },
  ],
  preview: {
    select: {
      title: 'post.title',
      subtitle: 'author',
      media: 'post.mainImage.asset',
    },
  },
}
