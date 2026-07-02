"use client"

import { useState, useTransition } from "react"
import { createUser } from "@/lib/actions/admin"

export function AddUserForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await createUser(fd)
      } catch (err: any) {
        setError(err?.message ?? "Failed to create user. Please try again.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">
          Full Name <span className="text-[#ba1a1a]">*</span>
        </label>
        <input
          name="full_name"
          required
          placeholder="Jane Smith"
          className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">
          Email <span className="text-[#ba1a1a]">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="jane@example.com"
          className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">
          Password <span className="text-[#ba1a1a]">*</span>
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1c1b1b] mb-2">
          Role <span className="text-[#ba1a1a]">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="cursor-pointer">
            <input type="radio" name="role" value="tech" defaultChecked className="sr-only peer" />
            <div className="h-14 rounded-xl border-2 border-[#e5e2e1] peer-checked:border-[#003ec7] peer-checked:bg-[#003ec7] text-[#434656] peer-checked:text-white font-semibold text-sm flex items-center justify-center transition-colors">
              Tech
            </div>
          </label>
          <label className="cursor-pointer">
            <input type="radio" name="role" value="admin" className="sr-only peer" />
            <div className="h-14 rounded-xl border-2 border-[#e5e2e1] peer-checked:border-[#003ec7] peer-checked:bg-[#003ec7] text-[#434656] peer-checked:text-white font-semibold text-sm flex items-center justify-center transition-colors">
              Admin
            </div>
          </label>
        </div>
      </div>

      {error && (
        <p className="text-sm text-[#ba1a1a] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base disabled:opacity-60 transition-colors hover:bg-[#0033a8]"
      >
        {isPending ? "Creating…" : "Create User"}
      </button>
    </form>
  )
}
