export interface MyFatoorahLineItem {
  ItemName: string
  Quantity: number
  UnitPrice: number
}

export interface MyFatoorahInitiateRequest {
  InvoiceValue: number
  NotificationOption: "LNK" | "EML" | "SMS" | "ALL"
  DisplayCurrencyIso: "KWD"
  CustomerName: string
  CustomerEmail: string
  CustomerMobile: string
  CallBackUrl: string
  ErrorUrl: string
  Language: "EN" | "AR"
  UserDefinedField: string
  InvoiceItems: MyFatoorahLineItem[]
  PaymentMethodId?: number
}

export interface MyFatoorahInitiateResponse {
  IsSuccess: boolean
  Data: {
    InvoiceId: number
    InvoiceURL: string
  }
}

export interface MyFatoorahCallbackPayload {
  paymentId: string
  Id: string
}

export interface PaymentStatus {
  invoiceId: string
  status: "Paid" | "Failed" | "Pending"
  paymentMethod: string
  paidAmount: number
  transactionDate: string
  userDefinedField: string
}
