import React from 'react'
export default {
  name: 'imageGroups',
  title: 'Image Groups',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Image Group Title',
      type: 'string',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {type: 'image'},
        {
          title: 'URL',
          name: 'urlObject',
          type: 'object',
          fields: [
            {
              title: 'URL',
              name: 'urlField',
              type: 'url'
            }
          ],
          preview: {
            select: {
              media: 'urlField',
            },
            prepare(selection) {
              const {media} = selection
              console.log(selection)
              return Object.assign({}, selection, {
                media: <img src={media} />,
                title: media,
              })
            },
          },
        }
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'body',
    },
    prepare(selection) {
      const {media} = selection
      let changedMedia
      if (media[0]._type == 'image') {
        changedMedia = media[0].asset
      } else {
        changedMedia = <img src={media[0].urlField} />
      }
      return Object.assign({}, selection, {
        media: changedMedia
      })
    },
  },
}