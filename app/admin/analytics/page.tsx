import { getDailyRevenue, getTotals, getPaymentMethodBreakdown, getCapacityByClassroom, getPopularClassrooms } from "@/lib/admin/db/analytics"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import RevenueChart from "./RevenueChart"
import PaymentMethodChart from "./PaymentMethodChart"
import CapacityTable from "./CapacityTable"
import PopularSlotsChart from "./PopularSlotsChart"

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const [dailyRevenue, totals, paymentMethods, capacity, popularSlots] = await Promise.all([
    getDailyRevenue(30),
    getTotals(),
    getPaymentMethodBreakdown(),
    getCapacityByClassroom(),
    getPopularClassrooms(),
  ])

  const avgFill =
    capacity.length > 0
      ? Math.round(capacity.reduce((s, c) => s + c.fill, 0) / capacity.length)
      : 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`${totals.totalRevenue.toFixed(3)} KD`}
          sub="All paid bookings"
        />
        <StatCard
          label="Total Bookings"
          value={totals.totalBookings.toString()}
          sub={`${totals.paidBookings} paid`}
        />
        <StatCard
          label="Avg Capacity Fill"
          value={`${avgFill}%`}
          sub="Across active classrooms"
        />
        <StatCard
          label="Payment Methods"
          value={paymentMethods.length.toString()}
          sub="Distinct methods used"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Daily Revenue — Last 30 Days (KD)</h3>
          <RevenueChart data={dailyRevenue} />
        </div>
        <div className="rounded-lg border bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Payment Methods</h3>
          <PaymentMethodChart data={paymentMethods} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Bookings by Classroom</h3>
          <PopularSlotsChart data={popularSlots} />
        </div>
        <div className="rounded-lg border bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Capacity Fill Rate</h3>
          <CapacityTable data={capacity} />
        </div>
      </div>
    </div>
  )
}
