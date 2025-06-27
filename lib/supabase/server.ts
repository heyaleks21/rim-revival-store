import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Server-side singleton instance
let serverSupabaseInstance: ReturnType<typeof createClient> | null = null

export function createServerClient() {
  const cookieStore = cookies()

  if (serverSupabaseInstance) {
    return serverSupabaseInstance
  }

  serverSupabaseInstance = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })

  return serverSupabaseInstance
}
