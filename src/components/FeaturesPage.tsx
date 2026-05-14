import React from 'react';
import { motion } from 'motion/react';
import {
  Cloud,
  MessageSquare,
  BarChart,
  TrendingUp,
  Stethoscope,
  Network,
  Zap,
  Globe,
  Shield,
  Layout,
  FileText,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from './Navbar';

interface FeaturesPageProps {
  onAuth: () => void;
  onNavigate?: (page: string) => void;
}

export const FeaturesPage = ({ onAuth, onNavigate = () => {} }: FeaturesPageProps) => {
  const features = [
    {
      icon: Cloud,
      title: 'Connect Anything',
      description: 'Seamlessly ingest data from CSV, Excel, SQL databases, and cloud storage providers with one secure click.',
      color: 'bg-brand-primary/10 text-brand-primary',
    },
    {
      icon: MessageSquare,
      title: 'Natural Language',
      description: 'Ask questions like "Which channel had the highest ROI?" and get instant complex data interpretations.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: BarChart,
      title: 'Automated Visuals',
      description: 'Beautiful, publication-ready charts and reports generated automatically to tell your data story.',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'End-to-end encryption and compliance with SOC 2, GDPR, and industry standards for sensitive data.',
      color: 'bg-red-50 text-red-600',
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Analyze millions of data points in seconds with our optimized processing engine.',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      icon: Network,
      title: 'API Integration',
      description: 'Programmatic access to all analysis features via REST API for seamless app integration.',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const useCases = [
    {
      icon: TrendingUp,
      title: 'Financial Analysis',
      description: 'Real-time sentiment analysis and predictive risk modeling for global markets.',
      color: 'text-blue-600',
    },
    {
      icon: Stethoscope,
      title: 'Healthcare Insights',
      description: 'Bridge global clinical data to predict patient outcomes with genomic pattern recognition.',
      color: 'text-emerald-600',
    },
    {
      icon: Globe,
      title: 'Market Intelligence',
      description: 'Competitive benchmarking and market trend analysis across industries.',
      color: 'text-indigo-600',
    },
    {
      icon: BarChart,
      title: 'Operations',
      description: 'Supply chain optimization and resource allocation with predictive insights.',
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-background pt-16 sm:pt-20">
      <Navbar currentPage="features" onNavigate={onNavigate} onAuth={onAuth} />
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-on-surface"
          >
            Powerful Features for Data Intelligence
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-brand-surface-variant max-w-2xl mx-auto"
          >
            Everything you need to transform raw data into actionable insights with AI.
          </motion.p>
        </div>
      </header>

      {/* Core Features Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-on-surface mb-12 text-center">Core Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-slate-100 p-8 sm:p-10 rounded-2xl hover:shadow-xl hover:border-brand-primary/20 transition-all h-full"
                >
                  <div className={`${feature.color} w-14 h-14 flex items-center justify-center rounded-xl mb-6`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-brand-on-surface mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-brand-surface-variant leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-slate-50 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-on-surface mb-12 text-center">Industry Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {useCases.map((useCase, idx) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-slate-100 p-8 rounded-xl hover:shadow-lg transition-all"
                >
                  <Icon className={`${useCase.color} w-8 h-8 mb-4`} />
                  <h3 className="text-lg font-bold text-brand-on-surface mb-2">{useCase.title}</h3>
                  <p className="text-sm text-brand-surface-variant">{useCase.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center space-y-8 bg-brand-primary/5 border border-brand-primary/20 rounded-3xl p-8 sm:p-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-on-surface">Ready to Transform Your Data?</h2>
          <p className="text-lg text-brand-surface-variant">Start analyzing your data with AI today. No credit card required.</p>
          <button
            onClick={onAuth}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all hover:-translate-y-1"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>
    </div>
  );
};
