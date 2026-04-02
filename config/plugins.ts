import path from 'path';

export default ({ env }) => ({
  upload: {
    config: {
      provider: path.join(process.cwd(), 'src/upload-provider'),
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  preview: {
    enabled: false,
  },
  'provider-whitelist': {
    enabled: true,
    resolve: './src/plugins/provider-whitelist',
  },
});

