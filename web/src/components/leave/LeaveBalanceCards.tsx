
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

interface LeaveBalance {
  type: string;
  allocated: number;
  used: number;
  remaining: number;
}

interface LeaveBalanceCardsProps {
  leaveBalance: LeaveBalance[];
}

const LeaveBalanceCards = ({ leaveBalance }: LeaveBalanceCardsProps) => {
  return (
    <div className="grid md:grid-cols-4 gap-4">
      {leaveBalance.map((leave, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{leave.type}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leave.remaining} days</div>
            <p className="text-xs text-muted-foreground">
              Used: {leave.used} / {leave.allocated} days
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeaveBalanceCards;
