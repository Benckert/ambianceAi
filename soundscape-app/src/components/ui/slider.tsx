"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  variant?: "manual" | "ai" | "semantic"
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  variant = "manual",
  ...props
}: SliderProps) {
  const rangeGradient =
    variant === "ai"
      ? "bg-gradient-to-r from-indigo-500 to-purple-500"
      : variant === "semantic"
      ? "bg-gradient-to-r from-pink-400 to-rose-500"
      : "bg-gradient-to-r from-cyan-500 to-blue-500"

  const thumbGradient =
    variant === "ai"
      ? "bg-gradient-to-br from-indigo-400 to-purple-500"
      : variant === "semantic"
      ? "bg-gradient-to-br from-pink-400 to-rose-500"
      : "bg-gradient-to-br from-cyan-400 to-blue-500"

  const thumbShadow =
    variant === "ai"
      ? "shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 focus-visible:shadow-xl focus-visible:shadow-indigo-500/50"
      : variant === "semantic"
      ? "shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/50 focus-visible:shadow-xl focus-visible:shadow-pink-500/50"
      : "shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 focus-visible:shadow-xl focus-visible:shadow-cyan-500/50"

  return (
    <SliderPrimitive.Root 
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 py-3 cursor-pointer",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative grow overflow-hidden rounded-full bg-slate-700/50 h-1.5">
        <SliderPrimitive.Range className={`absolute h-full ${rangeGradient}`} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all hover:scale-110 focus-visible:scale-110 cursor-pointer",
          thumbGradient,
          thumbShadow
        )}
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }

