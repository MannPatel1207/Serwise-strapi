const fs = require('fs');
const path = require('path');
const docsPath = 'd:\\ServiceSmith\\apps\\serwise-strapi-app\\docs';

const files = ['API_OVERVIEW.md', 'DEVICE-TYPE.md', 'PAGE.md', 'PART.md', 'SERVICE.md', 'SUBSCRIPTION.md'];

files.forEach(file => {
    let content = fs.readFileSync(path.join(docsPath, file), 'utf8');
    
    content = content.replace(/\/api\/device-types/g, '/content-manager/collection-types/api::device-type.device-type')
                     .replace(/\/api\/services/g, '/content-manager/collection-types/api::service.service')
                     .replace(/\/api\/subscriptions/g, '/content-manager/collection-types/api::subscription.subscription')
                     .replace(/\/api\/parts/g, '/content-manager/collection-types/api::part.part')
                     .replace(/\/api\/pages/g, '/content-manager/collection-types/api::page.page')
                     .replace(/\/\${id}/g, '/\${documentId}')
                     .replace(/:id/g, ':documentId');
    
    fs.writeFileSync(path.join(docsPath, file), content, 'utf8');
});
console.log('Docs successfully updated.');
