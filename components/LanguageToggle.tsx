"use client"

import { useTranslation } from "@/utils/i18n"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function LanguageToggle() {
  const { currentLocale, changeLanguage } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="btn-cyberpunk bg-transparent">
          Language: {currentLocale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="panel-cyberpunk">
        <DropdownMenuItem onClick={() => changeLanguage("en")} className="hover:bg-[#00cc00] hover:text-[#0a0a0a]">
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("pt-BR")} className="hover:bg-[#00cc00] hover:text-[#0a0a0a]">
          Português (BR)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
