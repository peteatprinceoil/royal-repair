"use client"

import { useActionState } from "react"
import { login, type LoginState } from "@/lib/actions/auth"

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8] px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-bold leading-[34px] text-[#1c1b1b]">Royal Repair</h1>
          <p className="mt-1 text-base text-[#434656]">Sign in to your account</p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#1c1b1b] mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#1c1b1b] mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-[#ba1a1a] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-14 rounded-lg bg-[#003ec7] text-white font-bold text-base tracking-wide disabled:opacity-60 transition-colors hover:bg-[#0033a8] active:bg-[#002a8a]"
          >
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
