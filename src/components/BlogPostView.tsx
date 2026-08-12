import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Clock, User, ChevronRight, Tag, PhoneCall, ShieldCheck, ArrowLeft, ArrowRight, Share2, Wrench } from 'lucide-react';
import { getBlogPostBySlug, getRelatedBlogPosts, BlogPost } from '../lib/blogLoader';

interface BlogPostViewProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export default function BlogPostView({ slug, onNavigate }: BlogPostViewProps) {
  const post = getBlogPostBySlug(slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-4">Article Not Found</h1>
        <p className="text-slate-600 mb-8">The blog article you are looking for does not exist or may have been moved.</p>
        <button
          onClick={() => onNavigate('blog')}
          className="bg-blue-900 text-white font-bold px-6 py-3 rounded-xl text-sm"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  const relatedPosts = getRelatedBlogPosts(post.slug, post.category, 2);

  // Custom link click interceptor for internal routes in markdown content
  const handleMarkdownLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (!href) return;
    if (href.startsWith('/')) {
      e.preventDefault();
      const cleanPath = href.replace(/^\//, '');
      onNavigate(cleanPath);
    }
  };

  return (
    <article className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">

        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-blue-900 transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => onNavigate('blog')}
            className="hover:text-blue-900 transition-colors"
          >
            Blog
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {post.title}
          </span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => onNavigate('blog')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to All Articles
        </button>

        {/* Article Header Header Card */}
        <header className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm mb-8">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-blue-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {post.category}
            </span>
            {post.primaryKeyword && (
              <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-600" />
                {post.primaryKeyword}
              </span>
            )}
          </div>

          {/* Article Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 text-xs text-slate-600 font-medium">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <User className="w-4 h-4 text-blue-900" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400" />
                Published: {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              {post.updatedDate && (
                <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Updated: {new Date(post.updatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>

            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              Findlay, OH
            </span>
          </div>

          {/* Featured Image */}
          <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 max-h-[420px] bg-slate-900">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt}
              className="w-full h-full object-cover max-h-[420px]"
            />
          </div>
        </header>

        {/* Article Body Content */}
        <main className="bg-white rounded-3xl p-6 md:p-12 border border-slate-200 shadow-sm mb-12">
          <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-sm md:prose-p:text-base prose-a:text-blue-900 prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-li:text-sm md:prose-li:text-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, href, children, ...props }) => (
                  <a
                    href={href}
                    onClick={(e) => handleMarkdownLinkClick(e, href)}
                    className="text-blue-900 font-bold underline decoration-amber-500/50 hover:decoration-amber-500 transition-all"
                    {...props}
                  >
                    {children}
                  </a>
                )
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </main>

        {/* Internal Service Links & Callout Section */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 border border-slate-800 shadow-lg mb-12">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">
                Local Findlay Service Quick Links
              </span>
              <h3 className="text-xl md:text-2xl font-black">
                Need Professional Repairs in Hancock County?
              </h3>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl">
                Our certified technicians repair all overhead garage door brands, replace broken high-tension springs, and install modern smart openers.
              </p>
            </div>
            <a
              href="tel:5672940010"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 px-6 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 border border-amber-600 shadow-md shrink-0 w-full sm:w-auto"
            >
              <PhoneCall className="w-4 h-4 fill-current" />
              CALL DISPATCH: (567) 294-0010
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <button
              onClick={() => onNavigate('garage-door-spring-repair')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl font-bold text-center transition-colors border border-slate-700"
            >
              • Spring Repair
            </button>
            <button
              onClick={() => onNavigate('garage-door-opener-repair')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl font-bold text-center transition-colors border border-slate-700"
            >
              • Opener Repair
            </button>
            <button
              onClick={() => onNavigate('emergency-garage-door-repair')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-2.5 rounded-xl font-bold text-center transition-colors border border-slate-700 col-span-2 sm:col-span-1"
            >
              • 24/7 Emergency Repairs
            </button>
          </div>
        </section>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              Related Articles & Guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <article
                  key={rel.slug}
                  onClick={() => onNavigate(`blog/${rel.slug}`)}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase">
                      {rel.category}
                    </span>
                    <h4 className="font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors text-sm mt-2 leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {rel.description}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 group-hover:text-amber-700 mt-4 flex items-center gap-1">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  );
}
