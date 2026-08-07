import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://findlaygaragedoorrepair.com';

const staticRoutes = [
  '/',
  '/garage-door-repair',
  '/garage-door-spring-repair',
  '/garage-door-opener-repair',
  '/garage-door-opener-installation',
  '/garage-door-installation',
  '/emergency-garage-door-repair',
  '/city/findlay-oh',
  '/city/arlington-oh',
  '/city/bluffton-oh',
  '/city/fostoria-oh',
  '/city/mccomb-oh',
  '/city/vanlue-oh',
  '/city/rawson-oh',
  '/city/north-baltimore-oh',
  '/about',
  '/why-choose-us',
  '/service-areas',
  '/faqs',
  '/contact',
  '/privacy-policy',
  '/terms-and-conditions',
  '/blog'
];

function getBlogSlugs() {
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir);
  const slugs = [];

  for (const file of files) {
    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const filePath = path.join(blogDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const match = content.match(/slug:\s*["']?([^"'\n\r]+)["']?/);
      if (match && match[1]) {
        slugs.push(match[1].trim());
      } else {
        const fallbackSlug = file.replace(/\.(md|mdx)$/, '');
        slugs.push(fallbackSlug);
      }
    }
  }

  return slugs;
}

function generateSitemap() {
  const blogSlugs = getBlogSlugs();
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static routes
  for (const route of staticRoutes) {
    const priority = route === '/' ? '1.0' : route === '/blog' ? '0.8' : '0.8';
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${route}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Blog posts
  for (const slug of blogSlugs) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/blog/${slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf-8');
  console.log(`[Sitemap] Automatically generated sitemap.xml with ${staticRoutes.length + blogSlugs.length} URLs!`);
}

generateSitemap();
