"use client";
import BuySellModal from "@/components/modals/BuySellModal";
import StockHistoryGraph from "@/components/StockHistoryGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ValueSection from "@/components/ValueSection";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

interface StockData {
  price: number;
  timestamp: string;
}

export default function Home() {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [cash, setCash] = useState<number>(10000); // Starting cash
  const [totalInvested, setTotalInvested] = useState<number>(0); // Cash spent to calc return
  const [portfolio, setPortfolio] = useState<number>(0); // Stocks owned
  const [buyQuantity, setBuyQuantity] = useState<number>(0);
  const [sellQuantity, setSellQuantity] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const totalReturn = stockData
    ? portfolio * stockData.price - totalInvested
    : 0;
  const rateOfReturn = totalInvested ? (totalReturn / totalInvested) * 100 : 0;
  const portfolioValue = stockData ? portfolio * stockData?.price : 0;

  useEffect(() => {
    // This initialzes the SSE connections to the api stream
    const eventSource = new EventSource("/api/stream");

    // This will handle the incoming messages, so like the stock data
    eventSource.onmessage = (event) => {
      const data: StockData = JSON.parse(event.data); // Parses the Json data so it can be used
      setStockData(data); // update the stock data state above
    };
    // error handler here
    eventSource.onerror = (error) => {
      // consoles and shows the error to eh user
      console.error("SSE error:", error);
      setError("Failed to connect to the server");
      eventSource.close(); // this closes the SSE connection
    };

    // Simple cleanup function to close the sse connection when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []);

  const handleBuy = () => {
    if (stockData) {
      const cost = stockData.price * buyQuantity;
      if (cost <= cash) {
        setCash((prevCash) => prevCash - cost);
        setTotalInvested((prevCashSpent) => prevCashSpent + cost);
        setPortfolio((prevPortfolio) => prevPortfolio + buyQuantity);
        setBuyQuantity(1);
      } else {
        alert("Insufficient funds to buy stock.");
      }
    }
  };

  const handleSell = () => {
    if (stockData && portfolio > 0) {
      const revenue = stockData.price * sellQuantity;
      if (sellQuantity < 1) {
        alert("Please enter a valid quantity to sell.");
        return;
      }
      if (sellQuantity <= portfolio) {
        const averageCost = totalInvested / portfolio;
        const investedAmountToRemove = averageCost * sellQuantity;

        setCash((prevCash) => prevCash + revenue);
        setPortfolio((prevPortfolio) => prevPortfolio - sellQuantity);
        setTotalInvested(
          (prevInvested) => prevInvested - investedAmountToRemove
        );
        setSellQuantity(1);
      } else {
        alert("You don't own enough stocks to sell.");
      }
    }
  };

  if (!stockData?.price)
    return (
      <div className="min-h-screen flex items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Fetching Stock Data</h1>
        <Loader className=" animate-spin size-20" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto ">
        <Card className="bg-white dark:bg-black shadow-xl ">
          <div className="flex">
            <ValueSection
              cash={cash}
              stocks={portfolio}
              totalReturn={totalReturn}
              rateOfReturn={rateOfReturn}
              portfolioValue={portfolioValue}
            />
            <Card className="w-4/5 rounded-none ">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl">Heat Stock Trader</CardTitle>
                <CardTitle className="text-3xl">
                  <span className="text-lg">£</span>
                  {stockData?.price || "Loading..."}
                </CardTitle>
                <div className="flex gap-4 py-6">
                  <BuySellModal
                    stockPrice={stockData?.price || 0}
                    portfolio={portfolio}
                    handleBuy={handleBuy}
                    handleSell={handleSell}
                    sellQuantity={sellQuantity}
                    setSellQuantity={setSellQuantity}
                    buyQuantity={buyQuantity}
                    setBuyQuantity={setBuyQuantity}
                    cash={cash}
                  />
                </div>
              </CardHeader>
              <StockHistoryGraph />
            </Card>
          </div>
          <CardContent className="p-0">
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
