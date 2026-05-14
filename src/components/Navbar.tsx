import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onAuth: () => void;
}

export const Navbar = ({ currentPage, onNavigate, onAuth }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 font-bold text-xl text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
              W
            </div>
            <span className="hidden sm:inline">WhyAnalyst</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavigate('landing')}
              className={`font-semibold transition-colors ${
                currentPage === 'landing'
                  ? 'text-brand-primary'
                  : 'text-brand-on-surface hover:text-brand-primary'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('features')}
              className={`font-semibold transition-colors ${
                currentPage === 'features'
                  ? 'text-brand-primary'
                  : 'text-brand-on-surface hover:text-brand-primary'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className={`font-semibold transition-colors ${
                currentPage === 'pricing'
                  ? 'text-brand-primary'
                  : 'text-brand-on-surface hover:text-brand-primary'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => onNavigate('blog')}
              className={`font-semibold transition-colors ${
                currentPage === 'blog'
                  ? 'text-brand-primary'
                  : 'text-brand-on-surface hover:text-brand-primary'
              }`}
            >
              Blog
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`font-semibold transition-colors ${
                currentPage === 'contact'
                  ? 'text-brand-primary'
                  : 'text-brand-on-surface hover:text-brand-primary'
              }`}
            >
              Contact
            </button>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ y: -2 }}
            onClick={onAuth}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 hidden sm:inline" />
          </motion.button>
        </div>
      </div>
    </nav>
  );
};
