import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import NeonButton from '../../components/ui/NeonButton';
import GlassCard from '../../components/ui/GlassCard';

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect to test the waters.',
      features: [
        '20 AI Chats / day',
        '10 Code Generations / day',
        'Basic Project Templates',
        'Community Support',
      ],
      button: 'Get Started',
      link: '/register',
    },
    {
      name: 'Pro',
      price: '500',
      currency: 'PKR',
      period: '/mo',
      description: 'For serious developers.',
      features: [
        '500 AI Chats / day',
        '200 Code Generations / day',
        'Full Project Architect',
        'Document Analysis (PDF/Docx)',
        'Voice Assistant',
        'Priority Support',
      ],
      button: 'Upgrade to Pro',
      link: '/app/billing',
      highlight: true,
    }
  ];

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-hero text-fluid-title font-bold gradient-text mb-6">Simple, Transparent Pricing</h1>
        <p className="font-body text-fluid-lead text-muted">Supercharge your development workflow today.</p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <GlassCard key={plan.name} className={`p-8 relative ${plan.highlight ? 'border-neon-purple shadow-neon-purple' : ''}`}>
            {plan.highlight && (
              <div className="absolute top-0 right-8 transform -translate-y-1/2">
                <span className="bg-gradient-to-r from-neon-purple to-neon-pink text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider font-hero">
                  Most Popular
                </span>
              </div>
            )}
            
            <h2 className="font-hero text-fluid-heading font-bold mb-2">{plan.name}</h2>
            <p className="font-body text-fluid-body text-muted mb-6">{plan.description}</p>
            
            <div className="mb-8 font-hero">
              <span className="text-4xl font-bold">
                {plan.currency && <span className="text-2xl mr-1">{plan.currency}</span>}
                {plan.price}
              </span>
              <span className="text-muted ml-2">{plan.period}</span>
            </div>

            <ul className="space-y-4 mb-8 font-body text-fluid-body">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-muted">
                  <Check className="w-5 h-5 text-neon-blue mr-3 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link to={plan.link}>
              <NeonButton 
                variant={plan.highlight ? 'primary' : 'outline'} 
                magnetic={true}
                className="w-full justify-center"
              >
                {plan.button}
              </NeonButton>
            </Link>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
