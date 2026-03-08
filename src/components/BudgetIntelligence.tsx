import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BudgetAnalysis } from '@/types/trip';
import BackgroundCarousel from './BackgroundCarousel';

interface BudgetIntelligenceProps {
  budget: BudgetAnalysis;
}

const PIE_COLORS = [
  'hsl(200, 100%, 55%)',
  'hsl(170, 80%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 80%, 60%)',
  'hsl(152, 69%, 45%)',
  'hsl(0, 84%, 60%)',
];

export default function BudgetIntelligence({ budget }: BudgetIntelligenceProps) {
  const isOverBudget = budget.userBudget < budget.minimumBudget;
  const diff = budget.comfortableBudget - budget.userBudget;
  const diffPercent = Math.round((diff / budget.userBudget) * 100);
  const homeCurr = budget.homeCurrency;
  const curr = budget.currency;
  const showDual = homeCurr && homeCurr !== curr;

  const pieData = budget.breakdown.map((item) => ({
    name: item.category,
    value: item.recommended,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 relative">
      <BackgroundCarousel />

      <div className="relative z-10 space-y-6">
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
                  ? `You'll need about ${diffPercent}% more for a comfortable trip.`
                  : 'Your budget aligns well with recommended spending.'}
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
              <p className="text-xl font-display font-bold text-foreground mt-1">{homeCurr}{tier.value.toLocaleString()}</p>
              {showDual && <p className="text-xs text-muted-foreground">≈ {curr}{tier.value.toLocaleString()}</p>}
              <span className="text-xs text-muted-foreground">{tier.desc}</span>
            </motion.div>
          ))}
        </div>

        {/* Pie Chart */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h4 className="font-display font-bold text-foreground text-lg">💰 Budget Breakdown</h4>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${homeCurr}${value.toLocaleString()}${showDual ? ` (≈${curr}${value.toLocaleString()})` : ''}`, 'Recommended']}
                  contentStyle={{
                    background: 'hsl(220, 20%, 10%)',
                    border: '1px solid hsl(220, 15%, 25%)',
                    borderRadius: '12px',
                    color: 'hsl(210, 40%, 98%)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bars */}
          {budget.breakdown.map((item, i) => {
            const max = Math.max(item.userBudget, item.recommended);
            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">You: {homeCurr}{item.userBudget.toLocaleString()}</span>
                    <span className="text-primary font-semibold">Need: {homeCurr}{item.recommended.toLocaleString()}</span>
                  </div>
                </div>
                <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-full" style={{ width: `${(item.userBudget / max) * 100}%` }} />
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(item.recommended / max) * 100}%`, background: PIE_COLORS[i % PIE_COLORS.length], opacity: 0.7 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="glass rounded-2xl p-6">
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
      </div>
    </motion.div>
  );
}
