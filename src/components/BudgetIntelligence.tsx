import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import { BudgetAnalysis } from '@/types/trip';

interface BudgetIntelligenceProps {
  budget: BudgetAnalysis;
}

export default function BudgetIntelligence({ budget }: BudgetIntelligenceProps) {
  const isOverBudget = budget.userBudget < budget.minimumBudget;
  const diff = budget.comfortableBudget - budget.userBudget;
  const diffPercent = Math.round((diff / budget.userBudget) * 100);
  const homeCurr = budget.homeCurrency;
  const curr = budget.currency;
  const showDual = homeCurr && homeCurr !== curr;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      {/* Budget Alert */}
      <div className={`glass rounded-2xl p-6 border-2 ${isOverBudget ? 'border-warning/50' : 'border-success/50'}`}>
        <div className="flex items-start gap-3">
          {isOverBudget ? <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" /> : <TrendingUp className="w-6 h-6 text-success shrink-0 mt-0.5" />}
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {isOverBudget ? 'Budget Reality Check' : 'Your Budget Works!'}
            </h3>
            <p className="text-muted-foreground mt-1">
              {isOverBudget
                ? `You'll need about ${diffPercent}% more than planned for a comfortable trip.`
                : 'Your budget aligns well with the recommended spending.'}
            </p>
          </div>
        </div>
      </div>

      {/* Three Tiers */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Minimum', value: budget.minimumBudget, desc: 'Basic enjoyment', color: 'border-warning/50' },
          { label: 'Comfortable', value: budget.comfortableBudget, desc: 'Stress-free trip', color: 'border-accent/50' },
          { label: 'Ideal', value: budget.idealBudget, desc: 'Full experience', color: 'border-success/50' },
        ].map((tier, i) => (
          <motion.div key={tier.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }}
            className={`glass rounded-xl p-4 text-center border-2 ${tier.color}`}
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{tier.label}</span>
            <p className="text-xl font-display font-bold text-foreground mt-1">{curr}{tier.value.toLocaleString()}</p>
            {showDual && <p className="text-xs text-muted-foreground">≈ {homeCurr}{tier.value.toLocaleString()}</p>}
            <span className="text-xs text-muted-foreground">{tier.desc}</span>
          </motion.div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h4 className="font-display font-bold text-foreground">Budget Breakdown</h4>
        {budget.breakdown.map((item) => {
          const max = Math.max(item.userBudget, item.recommended);
          return (
            <div key={item.category} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">{item.category}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">You: {curr}{item.userBudget.toLocaleString()}</span>
                  <span className="text-primary font-semibold">Need: {curr}{item.recommended.toLocaleString()}</span>
                </div>
              </div>
              <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-full" style={{ width: `${(item.userBudget / max) * 100}%` }} />
                <div className="absolute inset-y-0 left-0 bg-primary/70 rounded-full" style={{ width: `${(item.recommended / max) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="glass rounded-xl p-5">
        <h4 className="font-display font-bold flex items-center gap-2 text-foreground mb-3">
          <Lightbulb className="w-5 h-5 text-warning" />
          Smart Budget Tips
        </h4>
        <ul className="space-y-2">
          {budget.tips.map((tip, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <ChevronRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              {tip}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
