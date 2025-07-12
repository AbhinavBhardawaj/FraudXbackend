export type Transaction = {
  [key: string]: number | string;
};

export type PredictionResult = Transaction & {
  id: string;
  prediction: 'Fraudulent' | 'Not Fraudulent';
  riskScore: number;
};

export type FeatureImportance = {
  feature: string;
  importance: number;
};

export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};
