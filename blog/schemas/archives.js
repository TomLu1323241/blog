export default {
  name: 'archives',
  title: 'Image Archives',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Image Archives Title',
      type: 'string',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          title: 'Image URL',
          name: 'urlObject',
          type: 'object',
          fields: [
            {
              title: 'URL',
              name: 'urlField',
              type: 'url'
            }
          ]
        }
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
}