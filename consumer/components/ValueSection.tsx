import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import { ToggleTheme } from "./ToggleTheme";
import { Separator } from "./ui/separator";

interface ValueSectionProps {
  rateOfReturn: number;
  totalReturn: number;
  portfolioValue: number;
  cash: number;
  stocks: number;
}

const ValueSection = ({
  rateOfReturn,
  totalReturn,
  portfolioValue,
  stocks,
  cash,
}: ValueSectionProps) => {
  return (
    <Card className=" w-2/5 rounded-none">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between">
          <CardTitle>Value</CardTitle>
          <ToggleTheme />
        </div>
        <CardTitle className="text-3xl">
          <span className=" text-xl">£</span>
          {portfolioValue.toFixed(2)}
        </CardTitle>
        <div className="flex gap-4">
          <div className="flex flex-col ite">
            <span className="text-xs text-gray-500">TOTAL RETURN</span>
            <span
              className={cn(
                rateOfReturn < 0 && "text-red-400",
                rateOfReturn > 0 && "text-green-500"
              )}
            >
              {totalReturn < 0 ? "-" : totalReturn > 0 ? "+" : ""}£
              {Math.abs(totalReturn).toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">RATE OF RETURN</span>
            <span
              className={cn(
                rateOfReturn < 0 && "text-red-400",
                rateOfReturn > 0 && "text-green-500"
              )}
            >
              {rateOfReturn.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Separator className="mb-8" />
        <div>
          <div className="flex justify-between mb-2">
            <h1>Cash</h1>£{cash.toFixed(2)}
          </div>
          <Separator />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <h1>Stocks</h1>
            {stocks}
          </div>
          <Separator />
        </div>
      </CardContent>
    </Card>
  );
};

export default ValueSection;
