"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Pencil } from "lucide-react"
import { updateCustomerFromJob, type CustomerState } from "@/lib/actions/customers"
import type { Customer } from "@/lib/types"

interface Props {
  customer: Pick<Customer, "id" | "name" | "phone" | "email" | "service_address">
  jobId: string
}

export function EditCustomerSheet({ customer, jobId }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const boundAction = updateCustomerFromJob.bind(null, customer.id, jobId)
  const [state, formAction, pending] = useActionState<CustomerState, FormData>(boundAction, undefined)

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-[#737688] hover:text-[#003ec7] transition-colors p-1 -mr-1">
        <Pencil size={15} />
        <span className="sr-only">Edit customer</span>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pt-2 pb-10">
        <SheetHeader className="px-0 pb-4">
          <SheetTitle className="text-lg font-bold text-[#1c1b1b]">Edit Customer</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="space-y-4">
          <Field id="ec-name" label="Full Name" name="name" defaultValue={customer.name} required />
          <Field id="ec-phone" label="Phone Number" name="phone" type="tel" defaultValue={customer.phone} required />
          <Field id="ec-email" label="Email Address" name="email" type="email" defaultValue={customer.email} required />
          <Field id="ec-address" label="Service Address" name="service_address" defaultValue={customer.service_address} required />

          {state?.message && (
            <p className="text-sm text-[#ba1a1a] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base disabled:opacity-60 hover:bg-[#0033a8] transition-colors"
          >
            {pending ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function Field({
  id, label, name, type = "text", defaultValue, required,
}: {
  id: string; label: string; name: string; type?: string; defaultValue?: string; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[#1c1b1b] mb-1">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] focus:outline-none focus:border-[#003ec7] transition-colors"
      />
    </div>
  )
}
