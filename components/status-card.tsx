"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface StatusCardProps {
  title: string
  status: string
  percentage: number
  icon: string
  color: "primary" | "secondary" | "accent"
  onClick?: () => void
  additionalContent?: ReactNode
  /** Match JEEXPERT login / portal tokens */
  portalStyle?: boolean
  className?: string
}

export default function StatusCard({
  title,
  status,
  percentage,
  icon,
  color,
  onClick,
  additionalContent,
  portalStyle,
  className,
}: StatusCardProps) {
  const colorClasses = portalStyle
    ? {
        primary: "bg-[#fde8d8] text-[var(--jx-terracotta)]",
        secondary: "bg-[var(--jx-cream)] text-[var(--jx-mid-2)]",
        accent: "bg-[#fef3ec] text-[var(--jx-amber)]",
      }
    : {
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        accent: "bg-accent/10 text-accent",
      }

  const progressColor = portalStyle
    ? {
        primary: "bg-[var(--jx-terracotta)]",
        secondary: "bg-[var(--jx-mid-2)]",
        accent: "bg-[var(--jx-amber)]",
      }
    : {
        primary: "bg-primary",
        secondary: "bg-secondary",
        accent: "bg-accent",
      }

  return (
    <Card
      className={cn(
        "gap-0 p-4 transition-shadow",
        portalStyle
          ? "rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md"
          : "border-2 hover:shadow-lg",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={`rounded-lg p-2 text-xl ${colorClasses[color]}`}>{icon}</div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-bold",
            portalStyle
              ? "bg-gray-100 text-gray-600"
              : "bg-muted text-muted-foreground",
          )}
        >
          {percentage}%
        </span>
      </div>

      <h3 className={cn("mb-0.5 text-sm font-bold", portalStyle ? "text-[var(--jx-night)]" : "text-foreground")}>{title}</h3>
      <p className={cn("mb-3 text-xs", portalStyle ? "text-gray-400" : "text-muted-foreground")}>{status}</p>

      <div
        className={cn(
          "h-1.5 w-full overflow-hidden rounded-full",
          portalStyle ? "bg-gray-100" : "bg-muted",
        )}
      >
        <div
          className={`h-full ${progressColor[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {onClick && additionalContent && (
        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {additionalContent}
        </div>
      )}
      {onClick && !additionalContent && (
        <p
          className={cn(
            "mt-2 text-center text-xs",
            portalStyle ? "text-gray-400" : "text-muted-foreground",
          )}
        >
          Voir les détails
        </p>
      )}
    </Card>
  )
}
