const BASE_URL =
  process.env.MYFATOORAH_TEST_MODE === "true"
    ? "https://apitest.myfatoorah.com"
    : "https://api.myfatoorah.com"

const API_KEY = process.env.MYFATOORAH_API_KEY ?? ""

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok || !json.IsSuccess) {
    throw new Error(json.Message ?? `MyFatoorah error: ${res.status}`)
  }
  return json as T
}

export const myfatoorah = {
  sendPayment: <T>(body: unknown) => request<T>("/v2/SendPayment", body),
  getPaymentStatus: <T>(body: unknown) => request<T>("/v2/GetPaymentStatus", body),
  makeRefund: <T>(body: unknown) => request<T>("/v2/MakeRefund", body),
}
