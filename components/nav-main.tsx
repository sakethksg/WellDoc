"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type Icon } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  className={cn(
                    "transition-all duration-200 ease-in-out group relative",
                    "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
                    "hover:shadow-sm hover:scale-[1.02]",
                    isActive && [
                      "bg-gradient-to-r from-primary/15 to-primary/5",
                      "text-primary font-medium shadow-sm",
                      "border-r-2 border-primary/60",
                      "before:absolute before:left-0 before:top-0 before:h-full before:w-1",
                      "before:bg-gradient-to-b before:from-primary before:to-primary/60",
                      "before:rounded-r-full before:shadow-lg before:shadow-primary/25"
                    ]
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3 w-full">
                    {item.icon && (
                      <item.icon 
                        className={cn(
                          "transition-all duration-200",
                          "group-hover:scale-110 group-hover:rotate-3",
                          isActive && "text-primary drop-shadow-sm"
                        )} 
                      />
                    )}
                    <span className={cn(
                      "transition-all duration-200",
                      isActive && "font-semibold"
                    )}>
                      {item.title}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
