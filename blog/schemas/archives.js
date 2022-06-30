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
      title: 'Links',
      name: 'links',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'grid'
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
}