"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { priceHistory } from "../app/auth/callback/actions";

export default function PriceChart({ productId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const history = await priceHistory(productId);
      
      // Transform Supabase data into Recharts format
      const formattedData = history.map((item) => ({
        price: item.price,
        date: new Date(item.checked_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));
      
      setData(formattedData);
      setLoading(false);
    }
    fetchHistory();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm italic">
        Not enough data yet to show a trend.
      </div>
    );
  }

  return (
    <div className="w-full h-[200px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey="date" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#999' }}
          />
          <YAxis 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#999' }}
            domain={['auto', 'auto']} // Zooms the Y-axis to the price range
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
            itemStyle={{ color: "#f97316", fontWeight: "bold" }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3, fill: "#f97316" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}