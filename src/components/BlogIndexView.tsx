import React, { useState } from 'react';
import { Calendar, User, Clock, ChevronRight, Tag, ArrowRight, ShieldCheck, PhoneCall, Search } from 'lucide-react';
import { getAllBlogPosts, BlogPost } from '../lib/blogLoader';

interface BlogIndexViewProps {
  onNavigate: (path: string) => void;
}

export default function BlogIndexView({ onNavigate }: BlogIndexViewProps) {
  const posts = getAllBlogPosts();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.primaryKeyword.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-blue-900 transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Blog</span>
        </nav>

        {/* Page Hero Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-10 mb-10 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-3xl relative z-10">
            <span className="text-xs font-black tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/60 uppercase inline-block mb-3">
              Findlay Garage Door Insights & Advice
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Garage Door Repair & Maintenance Guides
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-4 leading-relaxed">
              Expert tips, safety checklists, and troubleshooting advice from certified garage door technicians serving Findlay, OH and Hancock County.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-900 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 my-8">
            <h3 className="text-lg font-bold text-slate-800">No articles found matching your criteria</h3>
            <p className="text-xs text-slate-500 mt-2">Try clearing your search query or selecting a different category.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-4 bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                onClick={() => onNavigate(`blog/${post.slug}`)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group hover:-translate-y-1"
              >
                {/* Featured Image */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.featuredImageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Meta Details */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mb-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-900" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {post.updatedDate && (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        Updated
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug mb-2">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 flex-grow">
                    {post.description}
                  </p>

                  {/* Footer Author & CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {post.author.split('(')[0].trim()}
                    </span>
                    <span className="text-xs font-bold text-amber-600 group-hover:text-amber-700 flex items-center gap-1">
                      Read Article
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom CTA Banner */}
        <section className="mt-16 bg-gradient-to-br from-blue-900 to-slate-950 text-white rounded-3xl p-8 md:p-12 border border-blue-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
              Need Immediate Garage Door Help in Findlay?
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Don't Let a Faulty Garage Door Disrupt Your Day
            </h2>
            <p className="text-blue-100 text-xs md:text-sm mt-2 leading-relaxed">
              Our local certified technicians offer same-day spring repairs, opener diagnostic calls, and 24/7 emergency dispatch across Hancock County.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <a
              href="tel:5672940010"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 px-6 rounded-xl text-xs tracking-wider text-center transition-all flex items-center justify-center gap-2 border border-amber-600 shadow-lg"
            >
              <PhoneCall className="w-4 h-4 fill-current" />
              CALL (567) 294-0010
            </a>
            <button
              onClick={() => onNavigate('contact')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-6 rounded-xl text-xs text-center border border-white/20 transition-all"
            >
              Request Free Estimate
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
