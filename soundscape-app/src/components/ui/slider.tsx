"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
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
            "absolute bg-gradient-to-r from-cyan-500 to-blue-500 data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="block size-5 shrink-0 rounded-full border-2 border-white bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-cyan-500/50 focus-visible:scale-110 focus-visible:shadow-xl focus-visible:shadow-cyan-500/50 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:cursor-grabbing"
        style={{ touchAction: "none" }}
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
