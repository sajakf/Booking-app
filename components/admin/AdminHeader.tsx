"use client"

import { signOut } from "next-auth/react"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  user?: { name?: string | null; email?: string | null }
}

export default function AdminHeader({ user }: Props) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3">
      <h1 className="text-sm font-semibold text-gray-700">Camp Management Portal</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="size-4" />
          <span>{user?.name ?? user?.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="gap-1.5"
        >
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </div>
    </header>
  )
}
