const fs = require('fs');
const path = require('path');
const dir = 'd:/Saas/tapsleek/packages/card-engine.tapsleek.com/src/widgets';
const files = ['gallery.ts', 'price-list.ts', 'service-list.ts', 'team.ts', 'testimonials.ts'];

files.forEach(f => {
  const file = path.join(dir, f);
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("{ key: 'useCarousel'")) {
    content = content.replace(/contentSchema:\s*\[/, "contentSchema: [\n    { key: 'useCarousel', type: 'boolean', label: 'Enable Carousel' },");
    content = content.replace(/contentSchema:\s*\[/, "contentSchema: [\n    { key: \"useCarousel\", type: \"boolean\", label: \"Enable Carousel\" },"); // Fallback
    fs.writeFileSync(file, content);
  }
});
console.log("Added useCarousel to contentSchema!");
