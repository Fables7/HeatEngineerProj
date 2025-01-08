"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import axios from "axios";
import { Button } from "./ui/button";

interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  symbol: string;
}

type TimeRange = "year" | "3months" | "month" | "week" | "today";

const timeRanges: { label: string; value: TimeRange }[] = [
  {
    label: "Today",
    value: "today",
  },
  {
    label: "1 Week",
    value: "week",
  },
  {
    label: "Month",
    value: "month",
  },
  {
    label: "3 Months",
    value: "3months",
  },
  {
    label: "Year",
    value: "year",
  },
];

const StockHistoryGraph = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("today");
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // This calculates the from and to timestamps for the api depending on which filter the user choses
  const calculateTimeRange = (
    range: TimeRange
  ): { from: number; to: number } => {
    const now = Date.now();
    let from = now;

    switch (range) {
      case "today":
        from = now - 24 * 60 * 60 * 1000;
        break;
      case "week":
        from = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        from = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "3months":
        from = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        from = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        from = now - 30 * 24 * 60 * 60 * 1000;
    }

    return { from, to: now };
  };


  // This function aggregates the data based on which time range was chjoses
  const aggregateData = (
    data: HistoricalDataPoint[],
    timeRange: TimeRange
  ): HistoricalDataPoint[] => {
    if (timeRange === "today") {
      // For 'today', aggregate data into 15-minute intervals
      const interval = 15 * 60 * 1000; // 15 minutes in milliseconds
      const groupedData = new Map<number, HistoricalDataPoint>();

      // This helps to show only every 15 minutes 
      data.forEach((point) => {
        const bucket = Math.floor(point.timestamp / interval) * interval;
        // Keep the last data point within each 15-minute interval
        groupedData.set(bucket, point);
      });

      // Convert the map to an array and sort by timestamp
      return Array.from(groupedData.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      );
    }

    // For other ranges, aggregate by day
    const groupedData = new Map<string, HistoricalDataPoint>();
    data.forEach((point) => {
      const dateKey = new Date(point.timestamp).toISOString().split("T")[0]; // YYYY-MM-DD
      groupedData.set(dateKey, point); // Keeps the last point for each day
    });
    return Array.from(groupedData.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
    // So in the graphs especially for week month and year, only records the last point of each day to make it look better, otherwise the whole graph is filled from every data point
  };

  // Function to get the historical data from the api
  const fetchHistoricalData = async (range: TimeRange) => {
    setLoading(true);
    setError(null);
    const { from, to } = calculateTimeRange(range);

    try {
      const response = await axios.get<HistoricalDataPoint[]>(
        `/api/history?from=${from}&to=${to}`
      );
      // Sort data by timestamp ascending
      const sortedData = response.data.sort(
        (a, b) => a.timestamp - b.timestamp
      );
      // Aggregate data based on timeRange
      const aggregatedData = aggregateData(sortedData, range);
      setHistoricalData(aggregatedData);
    } catch (err: any) {
      console.error("Error fetching historical data:", err);
      setError("Failed to load historical data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData(timeRange);

    // Set up interval to fetch data every 15 minutes
    const intervalId = setInterval(() => {
      fetchHistoricalData(timeRange);
    }, 15 * 60 * 1000); // 15 minutes in milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);
  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Stock Price History</CardTitle>
        <CardDescription>Updates every 15 min.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1  justify-end mb-4">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`${
                timeRange === range.value
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } `}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="loader"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(tick) => {
                  const date = new Date(tick); // This converts timestamp to date object
                  return timeRange === "today"
                    ? `${date.getHours().toString().padStart(2, "0")}:${date
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}` // This is formated for the Today option HH:MM
                    : `${date.getMonth() + 1}/${date.getDate()}`; // This is formated for the other options
                }}
                stroke="#555"
              />
              <YAxis
                domain={["auto", "auto"]} // Y-axis domain automatic
                tickFormatter={(tick) => `£${tick}`}
                stroke="#555"
              />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value: number) => [`£${value.toFixed(2)}`, "Price"]} // Format Y-axis ticks with sign
                contentStyle={{ backgroundColor: "#f5f5f5", border: "none" }}
              />
              <Line
                type="linear"
                dataKey="price"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={false}
                fill="none"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default StockHistoryGraph;
