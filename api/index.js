const strapi = require('@strapi/strapi');

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