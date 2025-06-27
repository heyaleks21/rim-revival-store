import type { ReactNode } from "react"
import { Sidebar } from "@/components/admin/layout/sidebar"
import { Header } from "@/components/admin/layout/header"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  // Check if this is the login page
  const isLoginPage = typeof window !== "undefined" ? window.location.pathname === "/admin/login" : false

  if (isLoginPage) {
    return <>{children}</>
  }

  // For other admin pages, require authentication
  const session = await getSession()

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <Header session={session} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
