import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildSubmitterPayload, DocuSealAdapter } from '@/lib/signing/docuseal'

describe('lib/signing/docuseal', () => {
  describe('buildSubmitterPayload', () => {
    it('builds a single-submitter array with default role', () => {
      const payload = buildSubmitterPayload({
        templateId: 1,
        orderId: 'o1',
        productSku: 'sku',
        submitter: { name: 'Ana', email: 'a@b.com' },
      })
      expect(payload).toEqual([{ name: 'Ana', email: 'a@b.com', role: 'First Party' }])
    })

    it('maps fields to values[] with name/default_value shape', () => {
      const payload = buildSubmitterPayload({
        templateId: 1,
        orderId: 'o1',
        productSku: 'sku',
        submitter: {
          name: 'Ana',
          email: 'a@b.com',
          role: 'Form Submitter',
          fields: { dni: '12345A', accepted: true },
        },
      })
      expect(payload[0].role).toBe('Form Submitter')
      expect(payload[0].values).toEqual([
        { name: 'dni', default_value: '12345A' },
        { name: 'accepted', default_value: true },
      ])
    })
  })

  describe('createFromTemplate', () => {
    const ORIG_FETCH = globalThis.fetch
    const ORIG_KEY = process.env.DOCUSEAL_API_KEY
    const ORIG_URL = process.env.DOCUSEAL_API_URL

    beforeEach(() => {
      process.env.DOCUSEAL_API_KEY = 'test-key'
      process.env.DOCUSEAL_API_URL = 'https://docuseal.test/api'
    })

    afterEach(() => {
      globalThis.fetch = ORIG_FETCH
      process.env.DOCUSEAL_API_KEY = ORIG_KEY
      process.env.DOCUSEAL_API_URL = ORIG_URL
    })

    it('POSTs /submissions with template_id + metadata and normalizes submission id', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ submission_id: 4242, status: 'awaiting' }],
      })
      globalThis.fetch = fetchMock as unknown as typeof fetch

      const adapter = new DocuSealAdapter()
      const result = await adapter.createFromTemplate({
        templateId: 7,
        orderId: 'order-xyz',
        productSku: 'AFD-RGPD-001',
        submitter: { name: 'Ana', email: 'a@b.com' },
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe('https://docuseal.test/api/submissions')
      expect(init.method).toBe('POST')
      expect(init.headers['X-Auth-Token']).toBe('test-key')
      const body = JSON.parse(init.body)
      expect(body.template_id).toBe(7)
      expect(body.send_email).toBe(true)
      expect(body.metadata).toEqual({ orderId: 'order-xyz', productSku: 'AFD-RGPD-001' })
      expect(body.submitters[0].email).toBe('a@b.com')

      expect(result.id).toBe('4242')
      expect(result.status).toBe('pending')
    })

    it('throws when API returns non-ok', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: async () => 'invalid template_id',
      }) as unknown as typeof fetch

      const adapter = new DocuSealAdapter()
      await expect(
        adapter.createFromTemplate({
          templateId: 7,
          orderId: 'o',
          productSku: 's',
          submitter: { name: 'Ana', email: 'a@b.com' },
        }),
      ).rejects.toThrow(/DocuSeal createFromTemplate failed \(422\): invalid template_id/)
    })

    it('throws if response lacks submission_id', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      }) as unknown as typeof fetch

      const adapter = new DocuSealAdapter()
      await expect(
        adapter.createFromTemplate({
          templateId: 7,
          orderId: 'o',
          productSku: 's',
          submitter: { name: 'Ana', email: 'a@b.com' },
        }),
      ).rejects.toThrow(/no submission_id/)
    })
  })
})
