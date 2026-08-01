const fs = require('fs');
const path = require('path');
const dir = 'd:/Saas/tapsleek/packages/card-engine.tapsleek.com/src/widgets';
const files = ['gallery.ts', 'faq.ts', 'testimonials.ts', 'team.ts', 'stats.ts', 'logo-wall.ts', 'feature-grid.ts', 'video-gallery.ts', 'service-list.ts'];

files.forEach(f => {
  const file = path.join(dir, f);
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/{ key: 'description', type: 'text',/g, "{ key: 'description', type: 'textarea',");
  content = content.replace(/{ key: "description", type: "text",/g, '{ key: "description", type: "textarea",');
  fs.writeFileSync(file, content);
});
console.log("Replaced text with textarea!");
