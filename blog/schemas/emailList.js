export default {
  name: 'emailList',
  title: 'Email',
  type: 'document',
  fields: [
    {
      name: 'emailList',
      title: 'Email',
      description: 'Name of the Author',
      type: 'string',
    },
    {
      name: 'verified',
      title: 'Verified',
      type: 'boolean',
      description: 'Emails will not send unless ',
    },
  ]
}
