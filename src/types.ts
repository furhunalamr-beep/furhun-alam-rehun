export type CalculatorType = 
  | 'margin' 
  | 'breakeven' 
  | 'discount'
  | 'roi' 
  | 'tvm' 
  | 'cac_ltv'
  | 'loan'
  | 'factoring'
  | 'payroll'
  | 'inventory'
  | 'currency'
  | 'tax'
  | 'saas'
  | 'elasticity'
  | 'mileage'
  | 'ecom_cost'
  | 'roas'
  | 'position_size'
  | 'risk_reward'
  | 'dca'
  | 'fx';

export type HistoryItem = {
  id: string;
  type: CalculatorType;
  title: string;
  timestamp: number;
  inputs: Record<string, number | string>;
  results: Record<string, number | string>;
  tags?: string[]; // Added
};

export type SavedTemplate = {
  id: string;
  type: CalculatorType;
  name: string;
  inputs: Record<string, number | string>;
  results?: Record<string, number | string>; // Added
  tags: string[]; // Added
};
