"use client";

import { useState } from 'react';
import styles from './Pricing.module.css';

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: "Starter",
      desc: "Perfect for occasional use.",
      priceMonthly: 0,
      priceAnnual: 0,
      popular: false,
      features: [
        "10 Conversions / day",
        "Max file size 10MB",
        "Basic tools access",
        "Email support"
      ]
    },
    {
      name: "Pro",
      desc: "For heavy users and professionals.",
      priceMonthly: 9,
      priceAnnual: 7, // ~20% off
      popular: true,
      features: [
        "Unlimited Conversions",
        "Max file size 2GB",
        "All premium tools access",
        "Priority 24/7 support",
        "No ads",
        "Batch processing"
      ]
    },
    {
      name: "Teams",
      desc: "For businesses and groups.",
      priceMonthly: 29,
      priceAnnual: 23, // ~20% off
      popular: false,
      features: [
        "Everything in Pro",
        "Up to 5 team members",
        "Centralized billing",
        "Admin dashboard",
        "API access"
      ]
    }
  ];

  return (
    <section className={styles.pricingSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Simple, transparent pricing</h2>
          <p className={styles.subtitle}>Select the tier that aligns with your document workflow requirements.</p>

          {/* Toggle Switch */}
          <div className={styles.toggleWrapper}>
            <span className={`${styles.toggleLabel} ${billingPeriod === 'monthly' ? styles.activeLabel : ''}`}>
              Bill Monthly
            </span>
            <button
              type="button"
              className={styles.toggleSwitch}
              onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              aria-label="Toggle billing cycle"
            >
              <div className={`${styles.toggleKnob} ${billingPeriod === 'annual' ? styles.knobAnnual : ''}`}></div>
            </button>
            <span className={`${styles.toggleLabel} ${billingPeriod === 'annual' ? styles.activeLabel : ''}`}>
              Bill Annually <span className={styles.discountBadge}>Save 20%</span>
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          {plans.map((plan) => {
            const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnual;

            return (
              <div key={plan.name} className={`${styles.card} ${plan.popular ? styles.cardPopular : ''}`}>
                {plan.popular && <span className={styles.popularBadge}>Most Popular</span>}
                
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={plan.popular ? styles.planDescPopular : styles.planDesc}>{plan.desc}</p>
                
                <div className={styles.priceRow}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.price}>{price}</span>
                  <span className={styles.period}>/month</span>
                </div>

                {billingPeriod === 'annual' && price > 0 && (
                  <p className={styles.billingAnnuallyText}>Billed annually (${price * 12}/yr)</p>
                )}

                <button className={`${styles.button} ${plan.popular ? styles.buttonPrimary : styles.buttonOutline}`}>
                  {plan.priceMonthly === 0 ? "Start for free" : "Upgrade to " + plan.name}
                </button>

                <hr className={plan.popular ? styles.dividerPopular : styles.divider} />

                <ul className={styles.featuresList}>
                  {plan.features.map((feature, i) => (
                    <li key={i} className={plan.popular ? styles.featureItemPopular : styles.featureItem}>
                      <svg className={plan.popular ? styles.featureIconPopular : styles.featureIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
