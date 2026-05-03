"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, School, Users, CalendarDays, Star, ClipboardList, Clock, BarChart2, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/bookings",     label: "Bookings",     icon: BookOpen },
  { href: "/admin/classrooms",   label: "Classrooms",   icon: School },
  { href: "/admin/instructors",  label: "Instructors",  icon: Users },
  { href: "/admin/sessions",     label: "Schedule",     icon: CalendarDays },
  { href: "/admin/attendance",   label: "Attendance",   icon: ClipboardList },
  { href: "/admin/waitlist",     label: "Waitlist",     icon: Clock },
  { href: "/admin/analytics",    label: "Analytics",    icon: BarChart2 },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-white flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
        <div className="flex size-8 items-center justify-center rounded-full bg-blue-500">
          <Star className="size-4 fill-current" />
        </div>
        <span className="font-bold text-sm leading-tight">Little Stars<br />Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-800 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
