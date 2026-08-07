export interface BlogPost {
  title: string;
  description: string;
  slug: string;
  date: string;
  updatedDate?: string;
  author: string;
  featuredImage: string;
  featuredImageAlt: string;
  primaryKeyword: string;
  category: string;
  content: string;
}

export function parseFrontMatter(raw: string, filePath: string): BlogPost {
  const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = raw.match(frontMatterRegex);

  const fallbackSlug = filePath.split('/').pop()?.replace(/\.(md|mdx)$/, '') || 'post';

  if (!match) {
    return {
      title: 'Untitled Post',
      description: '',
      slug: fallbackSlug,
      date: new Date().toISOString().split('T')[0],
      author: 'Findlay Garage Door Repair Team',
      featuredImage: '/images/garage-door-repair.webp',
      featuredImageAlt: 'Garage door repair Findlay OH',
      primaryKeyword: 'garage door repair',
      category: 'General',
      content: raw
    };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const metadata: Record<string, string> = {};

  yamlBlock.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
      const key = trimmed.slice(0, colonIdx).trim();
      let val = trimmed.slice(colonIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      metadata[key] = val;
    }
  });

  return {
    title: metadata.title || 'Untitled Post',
    description: metadata.description || '',
    slug: metadata.slug || fallbackSlug,
    date: metadata.date || new Date().toISOString().split('T')[0],
    updatedDate: metadata.updatedDate || undefined,
    author: metadata.author || 'Findlay Garage Door Repair Team',
    featuredImage: metadata.featuredImage || '/images/garage-door-repair.webp',
    featuredImageAlt: metadata.featuredImageAlt || metadata.title || 'Garage Door Repair',
    primaryKeyword: metadata.primaryKeyword || '',
    category: metadata.category || 'Garage Door Maintenance',
    content: content.trim()
  };
}

export function getAllBlogPosts(): BlogPost[] {
  // Automatically read all Markdown or MDX files from /content/blog/
  const blogModules = import.meta.glob('/content/blog/*.{md,mdx}', { query: '?raw', eager: true });
  
  const posts: BlogPost[] = [];

  for (const path in blogModules) {
    const mod = blogModules[path] as { default?: string } | string;
    const rawContent = typeof mod === 'string' ? mod : (mod.default || '');
    if (rawContent) {
      const post = parseFrontMatter(rawContent, path);
      posts.push(post);
    }
  }

  // Display blog posts in reverse chronological order
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllBlogPosts();
  return posts.find(p => p.slug === slug);
}

export function getRelatedBlogPosts(currentSlug: string, category: string, limit = 3): BlogPost[] {
  const posts = getAllBlogPosts().filter(p => p.slug !== currentSlug);
  const sameCategory = posts.filter(p => p.category === category);
  const otherCategory = posts.filter(p => p.category !== category);
  
  return [...sameCategory, ...otherCategory].slice(0, limit);
}
