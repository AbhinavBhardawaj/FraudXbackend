
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function FraudRulesCard() {
  const rules = [
    "Multiple rapid transactions",
    "High-risk location",
    "New device for user",
    "Deviates from spending patterns"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraud Rules</CardTitle>
        <CardDescription>
          Common rules triggered in fraud detection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
          {rules.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
