
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function UserInformationCard() {
  // This is a placeholder component.
  // In a real application, you would pass user data as props.
  const userInfo = {
    userID: 'txn_user_123',
    accountStatus: 'Active',
    accountAge: '2 years',
    deviceType: 'Mobile',
    purchaseHistory: 'Frequent',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
        <CardDescription>
          Details of the user making the transaction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
            <li><strong>User ID:</strong> {userInfo.userID}</li>
            <li><strong>Account Status:</strong> {userInfo.accountStatus}</li>
            <li><strong>Account Age:</strong> {userInfo.accountAge}</li>
            <li><strong>Device Type:</strong> {userInfo.deviceType}</li>
            <li><strong>Purchase History:</strong> {userInfo.purchaseHistory}</li>
        </ul>
      </CardContent>
    </Card>
  );
}
