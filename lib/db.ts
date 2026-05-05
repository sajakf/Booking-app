/**
 * lib/db.ts — Supabase-backed Prisma-compatible data client.
 *
 * Exposes `db.model.findMany/findFirst/findUnique/create/update/upsert/delete/
 * deleteMany/count/aggregate` matching the Prisma API surface used in this
 * codebase, backed entirely by @supabase/supabase-js + the anon key.
 *
 * Security: All calls happen server-side (Server Components, Route Handlers,
 * Server Actions). Row-Level Security is enforced at the Next.js auth layer.
 * When the service_role key is added to SUPABASE_SERVICE_ROLE_KEY, swap the
 * createClient call below to use it and tighten RLS policies.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js"

// ── Singleton client ──────────────────────────────────────────────────────────
const globalForSupa = globalThis as unknown as { _supa?: SupabaseClient }

function getClient(): SupabaseClient {
  if (!globalForSupa._supa) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    globalForSupa._supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return globalForSupa._supa
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a Supabase select string from a Prisma-style include/select object. */
function buildSelect(include?: Record<string, unknown>, select?: Record<string, unknown>): string {
  if (select) return Object.entries(select).filter(([, v]) => v).map(([k]) => k).join(", ") || "*"
  if (!include) return "*"
  const parts: string[] = ["*"]
  for (const [rel, val] of Object.entries(include)) {
    if (!val) continue
    if (val === true) { parts.push(`${rel}(*)`); continue }
    if (typeof val === "object") {
      const nested = val as Record<string, unknown>
      if (nested.include) parts.push(`${rel}(*, ${buildSelect(nested.include as Record<string, unknown>)})`)
      else parts.push(`${rel}(*)`)
    }
  }
  return parts.join(", ")
}

/** Apply a Prisma-style where clause to a Supabase query builder. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyWhere(q: any, where: Record<string, unknown>): any {
  for (const [key, value] of Object.entries(where)) {
    // Prisma compound-key: e.g. { bookingId_date: { bookingId, date } }
    if (key.includes("_") && typeof value === "object" && value !== null && !("in" in (value as object))) {
      const compound = value as Record<string, unknown>
      for (const [ck, cv] of Object.entries(compound)) {
        if (cv instanceof Date) q = q.eq(ck, cv.toISOString())
        else q = q.eq(ck, cv)
      }
      continue
    }
    if (value === null) { q = q.is(key, null); continue }
    if (value instanceof Date) { q = q.eq(key, value.toISOString()); continue }
    if (typeof value === "object") {
      const v = value as Record<string, unknown>
      if ("in" in v)       q = q.in(key, v.in as unknown[])
      if ("notIn" in v)    q = q.not(key, "in", `(${(v.notIn as unknown[]).join(",")})`)
      if ("contains" in v) q = q.like(key, `%${v.contains}%`)
      if ("gte" in v)      q = q.gte(key, v.gte instanceof Date ? (v.gte as Date).toISOString() : v.gte)
      if ("lte" in v)      q = q.lte(key, v.lte instanceof Date ? (v.lte as Date).toISOString() : v.lte)
      if ("gt" in v)       q = q.gt(key, v.gt instanceof Date ? (v.gt as Date).toISOString() : v.gt)
      if ("lt" in v)       q = q.lt(key, v.lt instanceof Date ? (v.lt as Date).toISOString() : v.lt)
      if ("not" in v)      q = q.neq(key, v.not)
    } else {
      q = q.eq(key, value)
    }
  }
  return q
}

/** Apply a Prisma-style orderBy to a Supabase query. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyOrderBy(q: any, orderBy: Record<string, string> | Record<string, string>[]): any {
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy]
  for (const o of orders) {
    for (const [field, dir] of Object.entries(o)) {
      q = q.order(field, { ascending: dir === "asc" })
    }
  }
  return q
}

/** Coerce Date strings back to Date objects for fields that are DateTime in Prisma schema. */
const DATE_FIELDS = new Set([
  "createdAt","updatedAt","paidAt","offeredAt","expiresAt","markedAt",
  "date","expiresAt","confirmationEmailSentAt","confirmationWhatsappSentAt",
])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function coerceDates(row: any): any {
  if (!row || typeof row !== "object") return row
  if (Array.isArray(row)) return row.map(coerceDates)
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    if (DATE_FIELDS.has(k) && typeof v === "string") out[k] = new Date(v)
    else if (typeof v === "object" && v !== null) out[k] = coerceDates(v)
    else out[k] = v
  }
  return out
}

// ── Model factory ─────────────────────────────────────────────────────────────
function makeModel(table: string) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async findMany({ where, orderBy, include, select, take, skip }: any = {}): Promise<any[]> {
      const supa = getClient()
      let q = supa.from(table).select(buildSelect(include, select))
      if (where)   q = applyWhere(q, where)
      if (orderBy) q = applyOrderBy(q, orderBy)
      if (skip != null && take != null) q = (q as any).range(skip, skip + take - 1)
      else if (take != null) (q as any).limit(take)
      const { data, error } = await q
      if (error) throw new Error(`[db.${table}.findMany] ${error.message}`)
      return coerceDates(data ?? [])
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async findFirst({ where, orderBy, include, select }: any = {}): Promise<any> {
      const supa = getClient()
      let q = supa.from(table).select(buildSelect(include, select)).limit(1)
      if (where)   q = applyWhere(q, where)
      if (orderBy) q = applyOrderBy(q, orderBy)
      const { data, error } = await q
      if (error) throw new Error(`[db.${table}.findFirst] ${error.message}`)
      return coerceDates(data?.[0] ?? null)
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async findUnique({ where, include, select }: any): Promise<any> {
      const supa = getClient()
      let q = supa.from(table).select(buildSelect(include, select)).limit(1)
      q = applyWhere(q, where)
      const { data, error } = await q
      if (error) throw new Error(`[db.${table}.findUnique] ${error.message}`)
      return coerceDates(data?.[0] ?? null)
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async create({ data, include }: any): Promise<any> {
      const supa = getClient()
      const { data: result, error } = await supa
        .from(table).insert(data).select(buildSelect(include)).single()
      if (error) throw new Error(`[db.${table}.create] ${error.message}`)
      return coerceDates(result)
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async update({ where, data, include }: any): Promise<any> {
      const supa = getClient()
      let q = supa.from(table).update(data).select(buildSelect(include))
      q = applyWhere(q, where)
      const { data: result, error } = await (q as any).single()
      if (error) throw new Error(`[db.${table}.update] ${error.message}`)
      return coerceDates(result)
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async upsert({ where, create: createData, update: updateData, include }: any): Promise<any> {
      const supa = getClient()
      // Check existence
      let checkQ = supa.from(table).select("id").limit(1)
      checkQ = applyWhere(checkQ, where)
      const { data: existing } = await checkQ

      if (existing?.[0]) {
        let q = supa.from(table).update(updateData).select(buildSelect(include))
        q = applyWhere(q, where)
        const { data: result, error } = await (q as any).single()
        if (error) throw new Error(`[db.${table}.upsert:update] ${error.message}`)
        return coerceDates(result)
      } else {
        const { data: result, error } = await supa
          .from(table).insert(createData).select(buildSelect(include)).single()
        if (error) throw new Error(`[db.${table}.upsert:insert] ${error.message}`)
        return coerceDates(result)
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async delete({ where }: any): Promise<any> {
      const supa = getClient()
      let q = supa.from(table).delete().select()
      q = applyWhere(q, where)
      const { data, error } = await (q as any).single()
      if (error) throw new Error(`[db.${table}.delete] ${error.message}`)
      return coerceDates(data)
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async deleteMany({ where }: any = {}): Promise<{ count: number }> {
      const supa = getClient()
      let q = supa.from(table).delete()
      if (where) q = applyWhere(q, where)
      const { error } = await q
      if (error) throw new Error(`[db.${table}.deleteMany] ${error.message}`)
      return { count: 0 }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async count({ where }: any = {}): Promise<number> {
      const supa = getClient()
      let q = supa.from(table).select("*", { count: "exact", head: true })
      if (where) q = applyWhere(q, where)
      const { count, error } = await q
      if (error) throw new Error(`[db.${table}.count] ${error.message}`)
      return count ?? 0
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async aggregate({ where, _sum, _count }: any): Promise<any> {
      const supa = getClient()
      let q = supa.from(table).select("*")
      if (where) q = applyWhere(q, where)
      const { data, error } = await q
      if (error) throw new Error(`[db.${table}.aggregate] ${error.message}`)
      const rows = data ?? []
      const result: Record<string, unknown> = {}
      if (_count !== undefined) result._count = rows.length
      if (_sum) {
        result._sum = {}
        for (const field of Object.keys(_sum)) {
          (result._sum as Record<string, number>)[field] = rows.reduce(
            (acc: number, row: Record<string, unknown>) => acc + ((row[field] as number) ?? 0), 0
          )
        }
      }
      return result
    },
  }
}

// ── Exported db client ────────────────────────────────────────────────────────
export const db = {
  adminUser:    makeModel("AdminUser"),
  classroom:    makeModel("Classroom"),
  instructor:   makeModel("Instructor"),
  session:      makeModel("Session"),
  booking:      makeModel("Booking"),
  waitlist:     makeModel("Waitlist"),
  bookingDraft: makeModel("BookingDraft"),
  attendance:   makeModel("Attendance"),
  parentAccount: makeModel("ParentAccount"),
  phoneOTP:     makeModel("PhoneOTP"),
}
