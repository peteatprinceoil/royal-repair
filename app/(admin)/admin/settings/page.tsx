import { createClient } from "@/lib/supabase/server"
import { updateSettings } from "@/lib/actions/admin"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase.from("settings").select("key, value")
  const discountPct = settings?.find((s) => s.key === "onsite_discount_pct")?.value ?? "10"

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-[24px] font-bold text-[#1c1b1b]">Settings</h1>

      <form action={updateSettings} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#1c1b1b] mb-1">
            On-Site Discount (%)
          </label>
          <p className="text-xs text-[#737688] mb-2">Applied to all jobs paid via QR code on-site.</p>
          <input
            name="onsite_discount_pct"
            type="number"
            min="0"
            max="100"
            step="0.5"
            defaultValue={discountPct}
            className="w-full h-14 px-4 rounded-lg border-2 border-[#e5e2e1] bg-white text-base focus:outline-none focus:border-[#003ec7]"
          />
        </div>
        <button
          type="submit"
          className="w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base hover:bg-[#0033a8] transition-colors"
        >
          Save Settings
        </button>
      </form>
    </div>
  )
}
