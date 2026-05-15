import React, { useMemo } from 'react';
import { useAppStore, PATHS } from '../store';
import Decimal from 'decimal.js';
import {
  TrendingUp,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const Dashboard = () => {
  const store = useAppStore();

  const metrics = useMemo(() => {
    const balance = new Decimal(store.balance);
    const targetBalance = new Decimal(store.targetBalance);
    const startingBalance = new Decimal(store.startingBalance);
    const currentDay = store.currentDay;
    const totalDays = store.totalDays;
    const reserveProfit = new Decimal(store.reserveProfit);
    const totalProfit = new Decimal(store.totalProfit);

    const progressionPercentage = startingBalance.greaterThan(0)
      ? balance.minus(startingBalance).dividedBy(targetBalance.minus(startingBalance)).times(100)
      : new Decimal('0');

    const remainingDays = Math.max(0, totalDays - currentDay + 1);
    const progressionTarget = new Decimal(store.dailyTargets[currentDay] || 0);
    const previousTarget = currentDay > 1 ? new Decimal(store.dailyTargets[currentDay - 1]) : startingBalance;
    const requiredDailyProfit = progressionTarget.minus(previousTarget);
    const requiredTotalToday = progressionTarget.minus(balance);

    let progressionHealth = 'Stable';
    const ratioToTarget = progressionTarget.greaterThan(0) ? balance.dividedBy(progressionTarget) : new Decimal(1);
    
    if (ratioToTarget.greaterThanOrEqualTo(1.1)) {
      progressionHealth = 'Accelerated';
    } else if (ratioToTarget.greaterThanOrEqualTo(1.0)) {
      progressionHealth = 'Efficient';
    } else if (ratioToTarget.greaterThanOrEqualTo(0.95)) {
      progressionHealth = 'Stable';
    } else if (ratioToTarget.greaterThanOrEqualTo(0.85)) {
      progressionHealth = 'Fragile';
    } else {
      progressionHealth = 'Unsustainable';
    }

    const pressureIndex = ratioToTarget.greaterThan(0)
      ? new Decimal('100').minus(ratioToTarget.times(100)).toNumber()
      : new Decimal('100').toNumber();

    const completionProbability = progressionPercentage.greaterThan(100)
      ? new Decimal('100')
      : progressionPercentage;

    return {
      balance: balance.toNumber(),
      targetBalance: targetBalance.toNumber(),
      startingBalance: startingBalance.toNumber(),
      reserveProfit: reserveProfit.toNumber(),
      totalProfit: totalProfit.toNumber(),
      currentDay,
      totalDays,
      remainingDays,
      progressionPercentage: Math.min(100, parseFloat(progressionPercentage.toString())),
      requiredDailyProfit: requiredDailyProfit.toNumber(),
      requiredTotalToday: requiredTotalToday.toNumber(),
      progressionHealth,
      pressureIndex: Math.min(100, Math.max(0, pressureIndex)),
      executionReadiness: Math.min(100, parseFloat(completionProbability.toString())),
      progressionTarget: progressionTarget.toNumber(),
    };
  }, [store.balance, store.targetBalance, store.startingBalance, store.currentDay, store.totalDays, store.dailyTargets, store.reserveProfit, store.totalProfit]);

  const healthColors = {
    Accelerated: 'text-void-emerald-glow',
    Efficient: 'text-void-cyan',
    Stable: 'text-void-purple-glow',
    Fragile: 'text-yellow-400',
    Unsustainable: 'text-red-400',
  };

  const healthBgColors = {
    Accelerated: 'bg-void-emerald/10 border-void-emerald/50',
    Efficient: 'bg-void-cyan/10 border-void-cyan/50',
    Stable: 'bg-void-purple/10 border-void-purple/50',
    Fragile: 'bg-yellow-500/10 border-yellow-500/50',
    Unsustainable: 'bg-red-500/10 border-red-500/50',
  };

  return (
    <div className="w-full min-h-screen px-4 sm:px-8 py-6 sm:py-12 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-void-purple-glow mb-2 font-mono tracking-tight">VOID TRADER OS</h1>
        <p className="text-void-cyan/60 text-sm font-light tracking-wider">INSTITUTIONAL CAPITAL OPERATING SYSTEM</p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Current Balance */}
        <div className="card-glass rounded-lg p-6 space-y-2 hover:border-void-purple/40 transition-all duration-300 group">
          <p className="text-xs text-void-cyan/60 uppercase tracking-wider">CURRENT BALANCE</p>
          <p className="text-3xl font-bold font-mono text-void-emerald-glow group-hover:text-void-emerald transition-colors">
            ${metrics.balance.toFixed(2)}
          </p>
          <p className="text-xs text-void-cyan/50 pt-2">
            Target: ${metrics.targetBalance.toFixed(2)}
          </p>
        </div>

        {/* Reserve Profit */}
        <div className="card-glass rounded-lg p-6 space-y-2 hover:border-void-cyan/40 transition-all duration-300 group">
          <p className="text-xs text-void-cyan/60 uppercase tracking-wider">RESERVE PROFIT</p>
          <p className="text-3xl font-bold font-mono text-void-cyan-bright group-hover:text-void-emerald-glow transition-colors">
            ${metrics.reserveProfit.toFixed(2)}
          </p>
          <p className="text-xs text-void-cyan/50 pt-2 flex items-center gap-1">
            <Zap size={12} /> Extra gains separated
          </p>
        </div>

        {/* Total Profit */}
        <div className="card-glass rounded-lg p-6 space-y-2 hover:border-void-purple-glow/40 transition-all duration-300 group">
          <p className="text-xs text-void-cyan/60 uppercase tracking-wider">TOTAL PROFIT</p>
          <p className={`text-3xl font-bold font-mono transition-colors ${
            metrics.totalProfit >= 0 ? 'text-void-emerald-glow' : 'text-red-400'
          }`}>
            ${metrics.totalProfit.toFixed(2)}
          </p>
          <p className="text-xs text-void-cyan/50 pt-2">Cumulative P&L</p>
        </div>
      </div>

      {/* Progression Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Progression Bar */}
        <div className="card-glass rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-void-purple-glow uppercase tracking-wider">PROGRESSION</p>
            <p className="text-xl font-bold font-mono text-void-cyan">{metrics.progressionPercentage.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-void-graphite/50 rounded-full h-3 border border-void-chrome/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-void-purple via-void-purple-glow to-void-cyan-bright rounded-full transition-all duration-500 ease-out shadow-glow-purple"
              style={{ width: `${Math.min(100, metrics.progressionPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between items-end gap-4 pt-4 border-t border-void-chrome/30">
            <div>
              <p className="text-xs text-void-cyan/60 uppercase tracking-wider">Day Progress</p>
              <p className="text-lg font-bold font-mono text-void-cyan-bright">{metrics.currentDay}/{metrics.totalDays}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-void-cyan/60 uppercase tracking-wider">Remaining</p>
              <p className="text-lg font-bold font-mono text-void-purple-glow">{metrics.remainingDays} days</p>
            </div>
          </div>
        </div>

        {/* Daily Targets */}
        <div className="card-glass rounded-lg p-6 space-y-4">
          <p className="text-sm font-bold text-void-emerald-glow uppercase tracking-wider mb-4">TODAY'S TARGET</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-void-graphite/30 rounded-lg p-4 border border-void-chrome/30">
              <p className="text-xs text-void-cyan/60 uppercase tracking-wider mb-2">Required Daily Profit</p>
              <p className="text-2xl font-bold font-mono text-void-emerald">${metrics.requiredDailyProfit.toFixed(2)}</p>
            </div>
            <div className="bg-void-graphite/30 rounded-lg p-4 border border-void-chrome/30">
              <p className="text-xs text-void-cyan/60 uppercase tracking-wider mb-2">Needed to Reach Target</p>
              <p className="text-2xl font-bold font-mono text-void-purple-glow">${metrics.requiredTotalToday.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-xs text-void-cyan/50 pt-2 flex items-center gap-1">
            <Target size={12} /> Per-trade target: ${(metrics.requiredDailyProfit / store.tradesPerDay).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Health & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Progression Health */}
        <div className={`card-glass rounded-lg p-6 space-y-2 border ${healthBgColors[metrics.progressionHealth]}`}>
          <p className="text-xs text-void-cyan/60 uppercase tracking-wider">PROGRESSION HEALTH</p>
          <p className={`text-2xl font-bold uppercase tracking-wider ${healthColors[metrics.progressionHealth]}`}>
            {metrics.progressionHealth}
          </p>
        </div>

        {/* Pressure Index */}
        <div className="card-glass rounded-lg p-6 space-y-2 hover:border-red-500/40 transition-all duration-300">
          <p className="text-xs text-void-cyan/60 uppercase tracking-wider">PRESSURE INDEX</p>
          <p className={`text-2xl font-bold font-mono ${
            metrics.pressureIndex > 70 ? 'text-red-400' : metrics.pressureIndex > 40 ? 'text-yellow-400' : 'text-void-emerald-glow'
          }`}>
            {metrics.pressureIndex.toFixed(0)}%
          </p>
        </div>

        {/* Execution Readiness */}
        <div className="card-glass rounded-lg p-6 space-y-2 hover:border-void-cyan/40 transition-all duration-300">
          <p className="text-xs text-void-cyan/60 uppercase tracking-wider">EXECUTION READINESS</p>
          <p className="text-2xl font-bold font-mono text-void-cyan-bright">{metrics.executionReadiness.toFixed(0)}%</p>
        </div>

        {/* Market Power */}
        <div className="card-glass rounded-lg p-6 space-y-2 hover:border-void-emerald/40 transition-all duration-300">
          <p className="text-xs text-void-cyan/60 uppercase tracking-wider">ACTIVE PATH</p>
          <p className="text-lg font-bold uppercase tracking-wider text-void-purple-glow">{store.path}</p>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="card-glass rounded-lg p-6">
        <h2 className="text-sm font-bold text-void-cyan uppercase tracking-wider mb-4">CONFIGURATION SUMMARY</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          {[
            { label: 'Broker', value: store.broker.toUpperCase() },
            { label: 'Account Type', value: store.accountType },
            { label: 'Pair', value: store.pair },
            { label: 'Risk %', value: `${store.riskPercentage.toString()}%` },
            { label: 'RR Ratio', value: `${store.rrRatio.toString()}:1` },
            { label: 'Trades/Day', value: store.tradesPerDay },
          ].map((item) => (
            <div key={item.label} className="bg-void-graphite/30 rounded-lg p-3 border border-void-chrome/20 text-center">
              <p className="text-void-cyan/50 uppercase tracking-wider text-xs mb-1">{item.label}</p>
              <p className="font-bold font-mono text-void-purple-glow">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
