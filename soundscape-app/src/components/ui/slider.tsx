"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  variant?: "manual" | "ai"
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
      : "bg-gradient-to-r from-cyan-500 to-blue-500"

  const thumbGradient =
    variant === "ai"
      ? "bg-gradient-to-br from-indigo-400 to-purple-500"
      : "bg-gradient-to-br from-cyan-400 to-blue-500"

  const thumbShadow =
    variant === "ai"
      ? "shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 focus-visible:shadow-xl focus-visible:shadow-indigo-500/50"
      : "shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 focus-visible:shadow-xl focus-visible:shadow-cyan-500/50"

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col py-3 cursor-pointer active:cursor-grabbing",
        className
      )}
      style={{ touchAction: "none" }}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full bg-slate-700/50 data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5 cursor-pointer active:cursor-grabbing"
        )}
        style={{ touchAction: "none" }}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            rangeGradient
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className={cn(
          "block size-5 shrink-0 rounded-full border-2 border-white shadow-lg transition-all hover:scale-110 focus-visible:scale-110 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:cursor-grabbing",
          thumbGradient,
          thumbShadow
        )}
        style={{ touchAction: "none" }}
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
