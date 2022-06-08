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
      createdAt: '_createdAt',
    },
    prepare(selection) {
      const { subtitle, createdAt } = selection
      return Object.assign({}, selection, {
        subtitle: `${subtitle} - ${(new Date(createdAt)).toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: '2-digit', hour12: true, hour: '2-digit', minute: '2-digit'
        })}`
      })
    },
  },
}
