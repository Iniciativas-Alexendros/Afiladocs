import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { createFromTemplate, getTemplateSignedUrl, updateOrder, createDocument } = vi.hoisted(() => ({
  createFromTemplate: vi.fn(),
  getTemplateSignedUrl: vi.fn(),
  updateOrder: vi.fn(),
  createDocument: vi.fn(),
}))

vi.mock('@/lib/signing/docuseal', () => ({
  DocuSealAdapter: class {
    createFromTemplate = createFromTemplate
  },
}))

vi.mock('@/lib/storage/templates', () => ({
  getTemplateSignedUrl,
  DEFAULT_TEMPLATE_TTL_SEC: 60 * 60 * 24 * 7,
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    orders: { update: updateOrder },
    documents: { create: createDocument },
  },
}))

import { dispatchByProductKind } from '@/lib/orders/dispatch'

type Order = Parameters<typeof dispatchByProductKind>[0]
type Product = Parameters<typeof dispatchByProductKind>[1]

const BASE_ORDER = {
  id: 'order-1',
  user_id: 'u1',
  product_id: 'legacy',
  product_sku: 'AFD-RGPD-001',
} as unknown as Order

const BASE_PRODUCT = {
  sku: 'AFD-RGPD-001',
  title: 'Registro',
  docuseal_template_id: '42',
  storage_path: null,
  delivery_mode: 'docuseal_fill_and_sign',
  eidas_level: 'SES',
} as unknown as Product

const CUSTOMER = { name: 'Ana', email: 'a@b.com' }

describe('dispatchByProductKind', () => {
  beforeEach(() => {
    createFromTemplate.mockReset()
    getTemplateSignedUrl.mockReset()
    updateOrder.mockReset().mockResolvedValue({})
    createDocument.mockReset().mockResolvedValue({})
  })

  afterEach(() => vi.clearAllMocks())

  it('docuseal_fill_and_sign: creates submission + documents row + awaiting_signature', async () => {
    createFromTemplate.mockResolvedValue({ id: '99', status: 'pending' })

    const result = await dispatchByProductKind(BASE_ORDER, BASE_PRODUCT, CUSTOMER)

    expect(result).toEqual({ kind: 'docuseal_submission', submissionId: '99' })
    expect(createFromTemplate).toHaveBeenCalledWith(expect.objectContaining({
      templateId: 42,
      orderId: 'order-1',
      productSku: 'AFD-RGPD-001',
      submitter: expect.objectContaining({ role: 'First Party' }),
    }))
    expect(createDocument).toHaveBeenCalledWith({
      data: expect.objectContaining({
        order_id: 'order-1',
        signing_document_id: '99',
        signing_provider: 'docuseal',
        status: 'draft',
      }),
    })
    expect(updateOrder).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'awaiting_signature' },
    })
  })

  it('docuseal_fill_only: submitter role is Form Submitter', async () => {
    createFromTemplate.mockResolvedValue({ id: '10', status: 'pending' })
    await dispatchByProductKind(
      BASE_ORDER,
      { ...BASE_PRODUCT, delivery_mode: 'docuseal_fill_only' },
      CUSTOMER,
    )
    expect(createFromTemplate.mock.calls[0][0].submitter.role).toBe('Form Submitter')
  })

  it('download_after_payment: generates signed URL and marks delivered', async () => {
    getTemplateSignedUrl.mockResolvedValue('https://signed.test/x')
    const product = { ...BASE_PRODUCT, delivery_mode: 'download_after_payment', storage_path: 'rgpd/x.docx' }

    const result = await dispatchByProductKind(BASE_ORDER, product, CUSTOMER)

    expect(result.kind).toBe('download_url')
    if (result.kind === 'download_url') {
      expect(result.signedUrl).toBe('https://signed.test/x')
      expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now())
    }
    expect(getTemplateSignedUrl).toHaveBeenCalledWith('rgpd/x.docx')
    expect(updateOrder).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'delivered' },
    })
  })

  it('human_review: marks intake_pending, no external call', async () => {
    const product = { ...BASE_PRODUCT, delivery_mode: 'human_review' }
    const result = await dispatchByProductKind(BASE_ORDER, product, CUSTOMER)
    expect(result).toEqual({ kind: 'human_review_pending' })
    expect(createFromTemplate).not.toHaveBeenCalled()
    expect(getTemplateSignedUrl).not.toHaveBeenCalled()
    expect(updateOrder).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'intake_pending' },
    })
  })

  it('throws when docuseal_* product has no docuseal_template_id', async () => {
    const product = { ...BASE_PRODUCT, docuseal_template_id: null }
    await expect(dispatchByProductKind(BASE_ORDER, product, CUSTOMER))
      .rejects.toThrow(/no docuseal_template_id/)
  })

  it('throws when download_after_payment has no storage_path', async () => {
    const product = { ...BASE_PRODUCT, delivery_mode: 'download_after_payment', storage_path: null }
    await expect(dispatchByProductKind(BASE_ORDER, product, CUSTOMER))
      .rejects.toThrow(/no storage_path/)
  })
})
