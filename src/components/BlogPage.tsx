import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { Navbar } from './Navbar';

interface BlogPageProps {
  onAuth: () => void;
  onNavigate?: (page: string) => void;
}

export const BlogPage = ({ onAuth, onNavigate = () => {} }: BlogPageProps) => {
  const posts = [
    {
      id: 1,
      title: 'How to Analyze Data Without Coding',
      excerpt: 'Discover how AI can help you extract meaningful insights from your data without writing a single line of code.',
      date: 'May 12, 2026',
      category: 'Tutorials',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'The Future of Data Analytics with AI',
      excerpt: 'Explore how artificial intelligence is transforming the data analytics landscape and what it means for your business.',
      date: 'May 10, 2026',
      category: 'Insights',
      readTime: '8 min read',
    },
    {
      id: 3,
      title: 'Best AI Data Analysis Tools 2026',
      excerpt: 'A comprehensive comparison of the top AI data analysis tools available today and how to choose the right one.',
      date: 'May 8, 2026',
      category: 'Comparisons',
      readTime: '10 min read',
    },
    {
      id: 4,
      title: 'Can AI Analyze Excel Data?',
      excerpt: 'Learn how modern AI tools can process, analyze, and generate insights from your Excel spreadsheets in seconds.',
      date: 'May 5, 2026',
      category: 'FAQ',
      readTime: '4 min read',
    },
    {
      id: 5,
      title: 'AI vs Traditional Data Analysis',
      excerpt: 'Understanding the differences between AI-powered analysis and traditional business intelligence approaches.',
      date: 'May 1, 2026',
      category: 'Analysis',
      readTime: '7 min read',
    },
    {
      id: 6,
      title: 'Getting Started with No-Code Data Analysis',
      excerpt: 'A beginner-friendly guide to analyzing data without technical expertise using AI-powered tools.',
      date: 'April 28, 2026',
      category: 'Getting Started',
      readTime: '6 min read',
    },
  ];

  const categories = ['All', 'Tutorials', 'Insights', 'Comparisons', 'FAQ', 'Analysis', 'Getting Started'];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-brand-background pt-16 sm:pt-20">
      <Navbar currentPage="blog" onNavigate={onNavigate} onAuth={onAuth} />
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-on-surface"
          >
            Blog & Resources
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-brand-surface-variant max-w-2xl mx-auto"
          >
            Learn how to master data analysis with AI. Tips, tutorials, and industry insights.
          </motion.p>
        </div>
      </header>

      {/* Category Filter */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-primary text-white'
                    : 'bg-white border border-slate-200 text-brand-on-surface hover:border-brand-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col"
              >
                <div className="p-6 sm:p-8 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-bold uppercase text-brand-primary">{post.category}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-brand-on-surface mb-3 leading-tight">
                    {post.title}
                  </h2>

                  <p className="text-sm sm:text-base text-brand-surface-variant mb-6 flex-grow">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </div>
                      <span>{post.readTime}</span>
                    </div>
                    <button className="text-brand-primary hover:text-brand-primary/80 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-brand-surface-variant">No posts found in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-slate-50 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center space-y-6 bg-brand-primary/5 border border-brand-primary/20 rounded-3xl p-8 sm:p-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-on-surface">Get Updates in Your Inbox</h2>
          <p className="text-lg text-brand-surface-variant">Subscribe to our newsletter for the latest tips and updates on data analysis with AI.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <button className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all">
              Subscribe
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
