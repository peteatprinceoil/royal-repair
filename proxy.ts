import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Public: payment page and Stripe webhook
  if (pathname.startsWith("/pay/") || pathname.startsWith("/api/stripe/webhook")) {
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect logged-in users away from login
  if (pathname === "/login") {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      const dest = profile?.role === "admin" ? "/admin" : "/jobs"
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return supabaseResponse
  }

  // All other routes require auth
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Admin routes require admin role
  if (pathname.startsWith("/admin")) {
    const role = user.user_metadata?.role as string | undefined
    if (role !== "admin") {
      // Double-check in DB in case metadata is stale
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/jobs", request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
}
