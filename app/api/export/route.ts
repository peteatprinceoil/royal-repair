import { createClient } from "@/lib/supabase/server"
import Papa from "papaparse"
import { format } from "date-fns"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") return new Response("Forbidden", { status: 403 })

  const url = new URL(request.url)
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")
  const statusFilter = url.searchParams.get("status")

  let query = supabase
    .from("jobs")
    .select("*, customers(name, email, phone, service_address), profiles(full_name)")
    .order("created_at", { ascending: false })

  if (from) query = query.gte("created_at", from)
  if (to) query = query.lte("created_at", to + "T23:59:59Z")
  if (statusFilter && statusFilter !== "all") query = query.eq("status", statusFilter)

  const { data: jobs } = await query

  const rows = (jobs ?? []).map((job) => {
    const c = job.customers as { name: string; email: string; phone: string; service_address: string } | null
    const p = job.profiles as { full_name: string } | null
    return {
      "Customer Name":    c?.name ?? "",
      "Service Address":  c?.service_address ?? "",
      "Phone":            c?.phone ?? "",
      "Email":            c?.email ?? "",
      "Job Title":        job.title,
      "Tech Name":        p?.full_name ?? "",
      "Created Date":     format(new Date(job.created_at), "MM/dd/yyyy"),
      "Sent Date":        job.sent_at ? format(new Date(job.sent_at), "MM/dd/yyyy") : "",
      "Paid Date":        job.paid_at ? format(new Date(job.paid_at), "MM/dd/yyyy") : "",
      "Subtotal":         job.subtotal.toFixed(2),
      "Discount %":       job.discount_pct.toFixed(2),
      "Discount Amount":  job.discount_amount.toFixed(2),
      "Total":            job.total.toFixed(2),
      "Payment Type":     job.payment_type,
      "Status":           job.status,
    }
  })

  const csv = Papa.unparse(rows)
  const filename = `royal-repair-export-${format(new Date(), "yyyy-MM-dd")}.csv`

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
