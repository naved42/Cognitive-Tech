import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import { Navbar } from './Navbar';

interface PricingPageProps {
  onAuth: () => void;
  onNavigate?: (page: string) => void;
}

export const PricingPage = ({ onAuth, onNavigate = () => {} }: PricingPageProps) => {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for getting started',
      features: [
        'Up to 5 datasets',
        'Basic analysis',
        '100 API calls/month',
        'Email support',
        'Community access',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'For growing teams',
      features: [
        'Unlimited datasets',
        'Advanced analysis',
        '10,000 API calls/month',
        'Priority email support',
        'Custom integrations',
        'Advanced visualizations',
        'Scheduled reports',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Unlimited everything',
        'Dedicated account manager',
        'Custom API limits',
        '24/7 phone support',
        'On-premise deployment',
        'Single sign-on (SSO)',
        'Custom workflows',
        'SLA guarantee',
      ],
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: 'Can I switch plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan anytime. Changes take effect at the next billing cycle.',
    },
    {
      question: 'What happens if I exceed my API limit?',
      answer: 'We notify you when you reach 80% of your limit. You can request an increase or upgrade to a higher plan.',
    },
    {
      question: 'Do you offer discounts for annual billing?',
      answer: 'Yes, annual plans receive a 20% discount. Contact sales for details.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, the Starter plan is free forever with basic features. No credit card required.',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-background pt-16 sm:pt-20">
      <Navbar currentPage="pricing" onNavigate={onNavigate} onAuth={onAuth} />
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-on-surface"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-brand-surface-variant max-w-2xl mx-auto"
          >
            Choose the perfect plan for your data analysis needs.
          </motion.p>
        </div>
      </header>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-2xl p-8 sm:p-10 transition-all ${
                  plan.highlighted
                    ? 'bg-brand-primary text-white border-2 border-brand-primary shadow-2xl transform scale-105 md:scale-100 md:ring-2 md:ring-brand-primary'
                    : 'bg-white border border-slate-100 hover:shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-400 text-brand-primary px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-brand-on-surface'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-brand-surface-variant'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div>
                    <span className={`text-4xl sm:text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-brand-on-surface'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`ml-2 ${plan.highlighted ? 'text-white/80' : 'text-brand-surface-variant'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={onAuth}
                    className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                      plan.highlighted
                        ? 'bg-white text-brand-primary hover:bg-slate-50'
                        : 'bg-brand-primary text-white hover:bg-brand-primary/90'
                    }`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-slate-200">
                    {plan.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-green-600'}`} />
                        <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-brand-on-surface'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-on-surface mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-lg p-6 border border-slate-100"
              >
                <h3 className="font-bold text-lg text-brand-on-surface mb-3">{faq.question}</h3>
                <p className="text-brand-surface-variant text-sm leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
