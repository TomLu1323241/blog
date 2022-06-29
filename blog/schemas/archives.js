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
      name: 'nsfw',
      title: 'NSFW',
      type: 'boolean',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
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