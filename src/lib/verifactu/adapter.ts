export interface InvoiceData {
  orderId: string
  userId: string
  productId: string
  amountCents: number
  currency: string
  issuedAt: Date
  customerNif: string
}

export interface VerifactuResult {
  invoiceId: string
  qrCode: string
  csvSignature: string
  chainHash: string
}

/**
 * Abstraction layer for Verifactu compliance (RD 1007/2023).
 * Implement this interface for each provider (EasyVerifactu, etc.).
 */
export interface VerifactuAdapter {
  createInvoice(data: InvoiceData): Promise<VerifactuResult>
  cancelInvoice(invoiceId: string): Promise<void>
  getStatus(invoiceId: string): Promise<{ status: string; lastError?: string }>
}
