import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Decimal from 'decimal.js';

export const PATHS = {
  TARGET: 'target',
  COMPOUND: 'compound',
  HYBRID: 'hybrid',
};

export const BROKER_CONFIG = {
  exness: {
    name: 'Exness',
    types: ['Standard', 'Standard Cent', 'Raw Spread', 'Zero', 'Pro'],
    pipValue: { EURUSD: 0.0001, GBPUSD: 0.0001, USDJPY: 0.01, AUDUSD: 0.0001, XAUUSD: 0.01 },
  },
  ftmo: {
    name: 'FTMO',
    types: ['Standard'],
    pipValue: { EURUSD: 0.0001, GBPUSD: 0.0001, USDJPY: 0.01, AUDUSD: 0.0001, XAUUSD: 0.01 },
  },
  fundingpips: {
    name: 'Funding Pips',
    types: ['Standard'],
    pipValue: { EURUSD: 0.0001, GBPUSD: 0.0001, USDJPY: 0.01, AUDUSD: 0.0001, XAUUSD: 0.01 },
  },
  icmarkets: {
    name: 'IC Markets',
    types: ['Standard', 'Raw Spread'],
    pipValue: { EURUSD: 0.0001, GBPUSD: 0.0001, USDJPY: 0.01, AUDUSD: 0.0001, XAUUSD: 0.01 },
  },
  pepperstone: {
    name: 'Pepperstone',
    types: ['Standard', 'Raw Spread'],
    pipValue: { EURUSD: 0.0001, GBPUSD: 0.0001, USDJPY: 0.01, AUDUSD: 0.0001, XAUUSD: 0.01 },
  },
};

export const EXECUTION_PROFILES = {
  conservative: { name: 'Conservative', glowIntensity: 'low', animationSpeed: 'slow' },
  balanced: { name: 'Balanced', glowIntensity: 'medium', animationSpeed: 'normal' },
  aggressive: { name: 'Aggressive', glowIntensity: 'high', animationSpeed: 'fast' },
};

Decimal.set({ precision: 10, rounding: Decimal.ROUND_DOWN });

const initialState = {
  balance: new Decimal('0'),
  reserveProfit: new Decimal('0'),
  totalProfit: new Decimal('0'),
  currentDay: 1,
  totalDays: 30,
  startingBalance: new Decimal('1000'),
  targetBalance: new Decimal('2000'),
  path: PATHS.TARGET,
  riskPercentage: new Decimal('2'),
  rrRatio: new Decimal('1.5'),
  tradesPerDay: 5,
  broker: 'exness',
  accountType: 'Standard',
  pair: 'EURUSD',
  dailyTargets: {},
  dailyActuals: {},
  progressionLogs: [],
  glowIntensity: 'medium',
  executionProfile: 'balanced',
  atmosphere: 'default',
};

const calculateDailyTargets = (startBal, targetBal, days, path) => {
  const targets = {};
  const start = new Decimal(startBal);
  const target = new Decimal(targetBal);
  const daysDecimal = new Decimal(days);
  
  if (path === PATHS.TARGET) {
    const dailyTarget = target.minus(start).dividedBy(daysDecimal);
    for (let i = 1; i <= days; i++) {
      targets[i] = dailyTarget.toNumber();
    }
  } else if (path === PATHS.COMPOUND) {
    const rate = target.dividedBy(start).pow(new Decimal(1).dividedBy(daysDecimal)).minus(1);
    let running = start;
    for (let i = 1; i <= days; i++) {
      const dayTarget = running.times(rate);
      targets[i] = dayTarget.toNumber();
      running = running.plus(dayTarget);
    }
  } else if (path === PATHS.HYBRID) {
    const linearDaily = target.minus(start).dividedBy(daysDecimal);
    const rate = target.dividedBy(start).pow(new Decimal(1).dividedBy(daysDecimal)).minus(1);
    let running = start;
    for (let i = 1; i <= days; i++) {
      const linear = linearDaily;
      const compound = running.times(rate);
      const hybrid = linear.plus(compound).dividedBy(new Decimal(2));
      targets[i] = hybrid.toNumber();
      running = running.plus(hybrid);
    }
  }
  
  return targets;
};

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      
      initializeStore: () => {
        const state = get();
        const targets = calculateDailyTargets(
          state.startingBalance,
          state.targetBalance,
          state.totalDays,
          state.path
        );
        if (Object.keys(state.dailyTargets).length === 0) {
          set({ dailyTargets: targets, balance: state.startingBalance });
        }
      },
      
      logProfit: (amount, day) => {
        const state = get();
        const profit = new Decimal(amount);
        const dailyTarget = new Decimal(state.dailyTargets[day] || 0);
        
        let progressionGain = profit;
        let reserve = new Decimal('0');
        
        if (profit.greaterThan(dailyTarget)) {
          progressionGain = dailyTarget;
          reserve = profit.minus(dailyTarget);
        }
        
        const newBalance = new Decimal(state.balance).plus(progressionGain);
        const newReserve = new Decimal(state.reserveProfit).plus(reserve);
        const newTotal = new Decimal(state.totalProfit).plus(profit);
        
        set({
          balance: newBalance,
          reserveProfit: newReserve,
          totalProfit: newTotal,
          dailyActuals: {
            ...state.dailyActuals,
            [day]: amount,
          },
          progressionLogs: [
            ...state.progressionLogs,
            {
              day,
              type: 'profit',
              amount: amount.toString(),
              timestamp: new Date().toISOString(),
            },
          ],
        });
      },
      
      logLoss: (amount, day) => {
        const state = get();
        const loss = new Decimal(amount);
        const newBalance = new Decimal(state.balance).minus(loss);
        
        set({
          balance: newBalance,
          totalProfit: new Decimal(state.totalProfit).minus(loss),
          dailyActuals: {
            ...state.dailyActuals,
            [day]: -amount,
          },
          progressionLogs: [
            ...state.progressionLogs,
            {
              day,
              type: 'loss',
              amount: amount.toString(),
              timestamp: new Date().toISOString(),
            },
          ],
        });
      },
      
      switchPath: (newPath) => {
        const state = get();
        const targets = calculateDailyTargets(
          state.balance,
          state.targetBalance,
          state.totalDays - state.currentDay + 1,
          newPath
        );
        set({ path: newPath, dailyTargets: targets });
      },
      
      updateSettings: (settings) => {
        set(settings);
      },
      
      saveSettings: () => {},
      loadSettings: () => {},
      
      resetCalculations: () => {
        const targets = calculateDailyTargets(
          initialState.startingBalance,
          initialState.targetBalance,
          initialState.totalDays,
          initialState.path
        );
        set({ ...initialState, dailyTargets: targets });
      },
      
      getProgressionHealth: () => {
        const state = get();
        const target = new Decimal(state.dailyTargets[state.currentDay] || 0);
        const actual = new Decimal(state.dailyActuals[state.currentDay] || 0);
        const ratio = target.greaterThan(0) ? actual.dividedBy(target) : new Decimal(1);
        
        if (ratio.lessThan('0.5')) return 'Fragile';
        if (ratio.lessThan('0.8')) return 'Unsustainable';
        if (ratio.lessThan('1')) return 'Stable';
        if (ratio.lessThan('1.3')) return 'Efficient';
        return 'Accelerated';
      },
      
      getPressureIndex: () => {
        const state = get();
        const totalTarget = Object.values(state.dailyTargets).reduce(
          (sum, val) => new Decimal(sum || 0).plus(new Decimal(val || 0)),
          new Decimal('0')
        );
        const totalActual = Object.values(state.dailyActuals).reduce(
          (sum, val) => new Decimal(sum || 0).plus(new Decimal(val || 0)),
          new Decimal('0')
        );
        const ratio = totalTarget.greaterThan(0) ? totalActual.dividedBy(totalTarget).toNumber() : 1;
        return Math.max(0, Math.min(100, (1 - ratio) * 100));
      },
    }),
    {
      name: 'void-trader-os-storage',
    }
  )
);
