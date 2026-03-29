import type { Schema, Struct } from '@strapi/strapi';

export interface BannerBannerTitleCta extends Struct.ComponentSchema {
  collectionName: 'components_banner_banner_title_ctas';
  info: {
    displayName: 'banner_title_cta';
  };
  attributes: {
    background_color: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'common.button-link-background', true>;
    image: Schema.Attribute.Media<'images'>;
    show_component: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    sub_title: Schema.Attribute.Component<'common.title-background', false>;
    title: Schema.Attribute.Component<'common.title-background', false>;
  };
}

export interface CommonAds extends Struct.ComponentSchema {
  collectionName: 'components_common_ads';
  info: {
    displayName: 'ads';
  };
  attributes: {
    show_component: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface CommonButtonLinkBackground extends Struct.ComponentSchema {
  collectionName: 'components_common_button_link_backgrounds';
  info: {
    displayName: 'button_link_background_border';
  };
  attributes: {
    action_link: Schema.Attribute.String;
    bg_color: Schema.Attribute.String;
    border_color: Schema.Attribute.String;
    border_width: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      >;
    show_component: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    text_color: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface CommonTitleBackground extends Struct.ComponentSchema {
  collectionName: 'components_common_title_backgrounds';
  info: {
    displayName: 'title_background';
  };
  attributes: {
    background_color: Schema.Attribute.String;
    show_component: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    text_color: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface HomeHomeDeviceTypes extends Struct.ComponentSchema {
  collectionName: 'components_home_home_device_types';
  info: {
    displayName: 'home_device_types';
  };
  attributes: {
    more_devices: Schema.Attribute.Component<'common.title-background', false>;
    show_component: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface HomeHomeNavbar extends Struct.ComponentSchema {
  collectionName: 'components_home_home_navbars';
  info: {
    displayName: 'home_navbar';
  };
  attributes: {
    menu: Schema.Attribute.Component<'common.button-link-background', true>;
    show_component: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface HomeHomeNotificationBanner extends Struct.ComponentSchema {
  collectionName: 'components_home_home_notification_banners';
  info: {
    displayName: 'home_notification_banner';
  };
  attributes: {
    notification_banner: Schema.Attribute.Component<
      'banner.banner-title-cta',
      true
    >;
    show_component: Schema.Attribute.Boolean;
  };
}

export interface HomeHomeWallet extends Struct.ComponentSchema {
  collectionName: 'components_home_home_wallets';
  info: {
    displayName: 'home_wallet';
  };
  attributes: {
    ads: Schema.Attribute.Component<'common.ads', false>;
    border_color: Schema.Attribute.String;
    border_width: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      >;
    cta_button: Schema.Attribute.Component<
      'common.button-link-background',
      false
    >;
    show_component: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SubscriptionServiceMapping extends Struct.ComponentSchema {
  collectionName: 'components_subscription_service_mappings';
  info: {
    description: '';
    displayName: 'Service Mapping';
  };
  attributes: {
    parts: Schema.Attribute.Relation<'manyToMany', 'api::part.part'>;
    providerCut: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    usageIndex: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'banner.banner-title-cta': BannerBannerTitleCta;
      'common.ads': CommonAds;
      'common.button-link-background': CommonButtonLinkBackground;
      'common.title-background': CommonTitleBackground;
      'home.home-device-types': HomeHomeDeviceTypes;
      'home.home-navbar': HomeHomeNavbar;
      'home.home-notification-banner': HomeHomeNotificationBanner;
      'home.home-wallet': HomeHomeWallet;
      'subscription.service-mapping': SubscriptionServiceMapping;
    }
  }
}
