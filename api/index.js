const strapi = require('@strapi/strapi');

module.exports = async (req, res) => {
    if (!global.strapi) {
        global.strapi = await strapi().load();
    }
    await global.strapi.server.httpServer.emit('request', req, res);
};