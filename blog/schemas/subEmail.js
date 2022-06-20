import React from 'react'
export default {
  name: 'subEmail',
  title: 'Email',
  type: 'document',
  fields: [
    {
      name: 'subEmail',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'verified',
      title: 'Verified',
      type: 'boolean',
    },
    {
      name: 'code',
      title: 'Verification Code',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'subEmail',
      subtitle: 'verified',
    },
    prepare(selection) {
      const { subtitle } = selection
      return Object.assign({}, selection, {
        media: subtitle ? <img src='/static/check.png' /> : <img src='/static/fail.png' />
      })
    },
  },
}
