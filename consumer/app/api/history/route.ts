import { NextResponse } from "next/server";
import axios from "axios";

interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  symbol: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  // ^^ gets the from and to values from the url

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Missing "from" or "to" query paramaters.' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get<HistoricalDataPoint[]>(
      `https://stocks.heat-engineer.dev/api/stocks/heat-engineer/history?from=${from}&to=${to}`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching historical data:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      {
        status: 500,
      }
    );
  }
}
