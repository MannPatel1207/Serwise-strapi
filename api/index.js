const strapi = require('@strapi/strapi');

// Force Vercel to include these modules and their package.json files in the bundle
try {
    require('@strapi/content-manager/package.json');
    require('@strapi/content-type-builder/package.json');
    require('@strapi/upload/package.json');
    require('@strapi/i18n/package.json');
    require('@strapi/email/package.json');
    require('@strapi/admin/package.json');
    require('@strapi/plugin-users-permissions/package.json');
    require('@strapi/plugin-graphql/package.json');
    require('@strapi/plugin-cloud/package.json');
} catch (e) {
    // These are for the Vercel NFT tracer to include the files
}

module.exports = async (req, res) => {
    try {
        if (!global.strapi) {
            console.log('Initializing Strapi...');
            const createStrapi = strapi.createStrapi || strapi.default?.createStrapi || strapi;
            
            if (typeof createStrapi !== 'function') {
                console.error('Strapi initialization failed: createStrapi is not a function', {
                    exportedKeys: Object.keys(strapi),
                    type: typeof strapi
                });
                throw new TypeError('strapi.createStrapi is not a function');
            }

            global.strapi = await createStrapi().load();
            global.strapi.server.mount();
            console.log('Strapi loaded and mounted successfully');
        }
        
        const handleRequest = global.strapi.server.app.callback();
        await handleRequest(req, res);
    } catch (error) {
        console.error('Error in Strapi serverless handler:', error);
        if (res.status) {
            res.status(500).send(error.message);
        } else {
            res.statusCode = 500;
            res.end(error.message);
        }
    }
};