"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { formatPrice } from "@/lib/utils"

interface SalesData {
  month: string
  sales: number
  revenue: number
}

interface SalesGraphProps {
  monthlySales: SalesData[]
}

export function SalesGraph({ monthlySales }: SalesGraphProps) {
  const [view, setView] = useState<"sales" | "revenue">("sales")

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Rim Sales Performance</CardTitle>
        <CardDescription>Monthly sales volume and revenue from rim products</CardDescription>
        <Tabs defaultValue="sales" className="w-[400px]" onValueChange={(v) => setView(v as "sales" | "revenue")}>
          <TabsList>
            <TabsTrigger value="sales">Units Sold</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sales: {
              label: "Units Sold",
              color: "hsl(var(--chart-1))",
            },
            revenue: {
              label: "Revenue",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="aspect-[16/9]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySales} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) =>
                  view === "revenue" ? formatPrice(value, { notation: "compact" }) : `${value}`
                }
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey={view}
                fill={`var(--color-${view})`}
                radius={[4, 4, 0, 0]}
                name={view === "sales" ? "Units Sold" : "Revenue"}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
