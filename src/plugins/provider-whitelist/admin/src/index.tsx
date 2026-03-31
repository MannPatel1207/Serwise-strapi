import pluginId from './pluginId';
import PluginIcon from './components/PluginIcon';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Provider Whitelist',
      },
      Component: async () => {
        const { default: App } = await import('./pages/App');
        return App;
      },
      permissions: [],
    });

    app.registerPlugin({
      id: pluginId,
      name: pluginId,
    });
  },
  bootstrap() {},
};
