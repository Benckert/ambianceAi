"use client";

import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";
import { LayersList } from "./LayerControl";
import { X } from "lucide-react";
import { useEffect, useRef } from "react"

interface LayersPopupProps {
  isOpen: boolean
  onClose: () => void
}

export const LayersPopup = ({ isOpen, onClose }: LayersPopupProps) => {
  const layers = useSoundscapeStore((state) => state.layers)
  const mouseDownTargetRef = useRef<EventTarget | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    // Track where the mouse down happened
    mouseDownTargetRef.current = e.target
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if both mousedown and mouseup happened on the backdrop
    // This prevents closing when dragging ends outside the modal
    if (
      e.target === e.currentTarget &&
      mouseDownTargetRef.current === e.target
    ) {
      onClose()
    }
    mouseDownTargetRef.current = null
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onMouseDown={handleBackdropMouseDown}
        onClick={handleBackdropClick}
      />

      {/* Popup */}
      <div className="fixed inset-x-4 top-20 bottom-32 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-20 sm:bottom-32 sm:w-full sm:max-w-2xl bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Active Layers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {layers.length} {layers.length === 1 ? "layer" : "layers"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {layers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-slate-400 text-sm sm:text-base">
                No layers yet. Add some sounds to get started!
              </p>
            </div>
          ) : (
            <LayersList />
          )}
        </div>
      </div>
    </>
  )
}
