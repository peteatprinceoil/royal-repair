import { createCustomer } from "@/lib/actions/customers"
import { CustomerForm } from "@/components/customers/CustomerForm"

export default function NewCustomerPage() {
  return (
    <div className="px-5 pt-6">
      <h1 className="text-[24px] font-bold text-[#1c1b1b] mb-6">Add Customer</h1>
      <CustomerForm action={createCustomer} />
    </div>
  )
}
