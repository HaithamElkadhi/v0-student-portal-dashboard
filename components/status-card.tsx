"use client"

import { Card } from "@/components/ui/card"

interface StatusCardProps {
  title: string
  status: string
  percentage: number
  icon: string
  color: "primary" | "secondary" | "accent"
}

export default function StatusCard({ title, status, percentage, icon, color }: StatusCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  }

  const progressColor = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
  }

  return (
    <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`text-3xl p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <span className="text-xs font-medium px-2 py-1 bg-muted text-muted-foreground rounded">{percentage}%</span>
      </div>

      <h3 className="font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{status}</p>

      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${progressColor[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  )
}
