"use client";
import StockHistoryGraph from "@/components/StockHistoryGraph";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface StockData {
  price: number;
  timestamp: string;
}

export default function Home() {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [cash, setCash] = useState<number>(10000); // Starting cash
  const [portfolio, setPortfolio] = useState<number>(0); // Stocks owned
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This initialzes the SSE connections to the api stream
    const eventSource = new EventSource("/api/stream");

    // This will handle the incoming messages, so like the stock data
    eventSource.onmessage = (event) => {
      const data: StockData = JSON.parse(event.data); // Parses the Json data so it can be used
      setStockData(data); // update the stock data state above

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
    };
  }, []);

  const handleBuy = () => {
    if (stockData) {
      const cost = stockData.price * buyQuantity;
      if (cost <= cash) {
        setCash((prevCash) => prevCash - cost);
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
        setCash((prevCash) => prevCash + revenue);
        setPortfolio((prevPortfolio) => prevPortfolio - sellQuantity);
        setSellQuantity(1);
      } else {
        alert("You don't own enough stocks to sell.");
      }
    }
  };

  const handleInputChange =
    (setter) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 0) {
        setter(value);
      }
    };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Heat Stock Trading
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Current Stock Price
              </h2>
              <div className="flex items-center justify-center">
                <span className="text-4xl font-bold">
                  {stockData ? `£${stockData.price.toFixed(2)}` : "Loading..."}
                </span>
              </div>
            </div>

            <StockHistoryGraph />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Your Holdings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">Cash</p>
                  <p className="text-2xl font-bold text-blue-900">
                    £{cash.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">Stocks</p>
                  <p className="text-2xl font-bold text-green-900">
                    {portfolio}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    if (buyQuantity === 1) return;
                    setBuyQuantity((prevAmount) => prevAmount - 1);
                  }}
                  size="icon"
                  variant="outline"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={buyQuantity}
                  onChange={handleInputChange(setBuyQuantity)}
                  className="w-20 text-center"
                  min="1"
                />
                <Button
                  onClick={() => setBuyQuantity((prevAmount) => prevAmount + 1)}
                  size="icon"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleBuy}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Buy
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    if (sellQuantity === 1) return;
                    setSellQuantity((prevAmount) => prevAmount - 1);
                  }}
                  size="icon"
                  variant="outline"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={sellQuantity}
                  onChange={handleInputChange(setSellQuantity)}
                  className="w-20 text-center"
                  min="1"
                  disabled={portfolio === 0}
                />
                <Button
                  onClick={() => {
                    if (sellQuantity < portfolio) {
                      setSellQuantity((prevAmount) => prevAmount + 1);
                    }
                  }}
                  size="icon"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSell}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Sell
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
