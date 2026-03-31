import type { StrapiApp } from '@strapi/strapi/admin';
import providerWhitelist from '../plugins/provider-whitelist/admin/src/index';

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    providerWhitelist.register(app);
  },
  bootstrap() {},
};
