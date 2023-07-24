export default {
  name: 'locations',
  title: 'Locations',
  type: 'document',
  fields: [
    {
      name: 'location',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'preNotes',
      title: 'Pre Visit Notes',
      type: 'string',
    },
    {
      name: 'postNotes',
      title: 'Post Visit Notes',
      type: 'string',
    },
    {
      name: 'previewImage',
      title: 'Main image',
      type: 'image',
    },
    {
      name: 'googleMapsUrl',
      title: 'Google Map Url',
      type: 'string',
    },
    {
      name: 'region',
      title: 'Region',
      type: 'string',
    },
    {
      name: 'visited',
      title: 'Visited',
      type: 'boolean',
    },
  ],
  preview: {
    select: {
      title: 'location',
      media: 'previewImage',
    },
  },
};
