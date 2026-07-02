"use client"

import { useActionState } from "react"
import type { CustomerState } from "@/lib/actions/customers"
import type { Customer } from "@/lib/types"

interface Props {
  action: (state: CustomerState, formData: FormData) => Promise<CustomerState>
  defaultValues?: Partial<Customer>
}

export function CustomerForm({ action, defaultValues }: Props) {
  const [state, formAction, pending] = useActionState<CustomerState, FormData>(action, undefined)

  return (
    <form action={formAction} className="space-y-5">
      <Field
        id="name"
        label="Full Name"
        name="name"
        placeholder="Jane Smith"
        defaultValue={defaultValues?.name}
        error={state?.errors?.name?.[0]}
        required
      />
      <Field
        id="phone"
        label="Phone Number"
        name="phone"
        type="tel"
        placeholder="(555) 555-5555"
        defaultValue={defaultValues?.phone}
        error={state?.errors?.phone?.[0]}
        required
      />
      <Field
        id="email"
        label="Email Address"
        name="email"
        type="email"
        placeholder="jane@example.com"
        defaultValue={defaultValues?.email}
        error={state?.errors?.email?.[0]}
        required
      />
      <Field
        id="service_address"
        label="Service Address"
        name="service_address"
        placeholder="123 Main St, City, TX 75001"
        defaultValue={defaultValues?.service_address}
        error={state?.errors?.service_address?.[0]}
        required
      />

      {state?.message && (
        <p className="text-sm text-[#ba1a1a] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base disabled:opacity-60 transition-colors hover:bg-[#0033a8]"
      >
        {pending ? "Saving…" : "Save Customer"}
      </button>
    </form>
  )
}

function Field({
  id,
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  error,
  required,
}: {
  id: string
  label: string
  name: string
  type?: string
  placeholder?: string
  defaultValue?: string
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[#1c1b1b] mb-1">
        {label} {required && <span className="text-[#ba1a1a]">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
      />
      {error && <p className="mt-1 text-sm text-[#ba1a1a]">{error}</p>}
    </div>
  )
}
