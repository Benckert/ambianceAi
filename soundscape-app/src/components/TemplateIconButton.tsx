import { LucideIcon, Loader2 } from "lucide-react"

interface TemplateIconButtonProps {
  icon: LucideIcon
  iconColor: string
  label: string
  onClick: () => void
  isLoading?: boolean
  isClicked?: boolean
}

export function TemplateIconButton({
  icon: Icon,
  iconColor,
  label,
  onClick,
  isLoading = false,
  isClicked = false,
}: TemplateIconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 ease-out border rounded-lg p-2 m-1 will-change-transform disabled:opacity-50 disabled:cursor-not-allowed ${
        isClicked
          ? "text-slate-200 scale-110 border-cyan-500/50 bg-cyan-950/30"
          : "hover:text-slate-200 hover:scale-110 hover:border-slate-500/50 border-transparent"
      }`}
    >
      {isLoading ? (
        <Loader2
          size={20}
          className="text-cyan-400 flex-shrink-0 animate-spin"
        />
      ) : (
        <Icon
          size={20}
          className={`${iconColor} flex-shrink-0`}
        />
      )}
      <span>{label}</span>
    </button>
  )
}
