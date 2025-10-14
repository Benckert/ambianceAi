import { LucideIcon } from "lucide-react"

interface TemplateIconButtonProps {
  icon: LucideIcon
  iconColor: string
  label: string
  onClick: () => void
}

export function TemplateIconButton({
  icon: Icon,
  iconColor,
  label,
  onClick,
}: TemplateIconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:text-slate-200 transition-colors"
    >
      <Icon size={20} className={`${iconColor} flex-shrink-0`} />
      <span>{label}</span>
    </button>
  )
}
