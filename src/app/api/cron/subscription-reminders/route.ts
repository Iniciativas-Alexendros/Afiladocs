import { NextResponse } from 'next/server'
import { serverEnv } from '@/lib/env'
import { prisma } from '@/lib/prisma/client'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/email/send'
import SubscriptionActive from '@/emails/subscription-active'
import React from 'react'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Cron: runs every Monday at 09:00 UTC (vercel.json schedule: "0 9 * * 1")
 *
 * Sends renewal reminder emails to clients with active subscriptions.
 * Only sends to subscriptions updated more than 25 days ago (approaching monthly renewal).
 * Verified via CRON_SECRET header (set by Vercel Cron).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = serverEnv.cronSecret

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 25)

    const subscriptions = await prisma.subscriptions.findMany({
      where: {
        status: 'active',
        updated_at: { lt: cutoff },
      },
      include: { user: true },
      take: 100, // Batch limit to avoid timeouts
    })

    const supabase = createServiceRoleClient()
    let emailsSent = 0

    for (const sub of subscriptions) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id)
        const email = userData?.user?.email
        if (!email) continue

        const renewalDate = new Date(sub.updated_at)
        renewalDate.setDate(renewalDate.getDate() + 30)

        await sendEmail({
          to: email,
          subject: 'Recordatorio de renovación — afiladocs',
          react: React.createElement(SubscriptionActive, {
            userName: sub.user.full_name ?? email,
            productName: sub.product_id,
            nextBillingDate: renewalDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
            portalUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/portal/suscripciones`,
          }),
        })
        emailsSent++
      } catch (emailErr) {
        console.error(JSON.stringify({
          event: 'cron.subscription_reminders.email_error',
          subscription_id: sub.id,
          message: emailErr instanceof Error ? emailErr.message : 'Unknown',
          ts: new Date().toISOString(),
        }))
      }
    }

    console.log(JSON.stringify({
      event: 'cron.subscription_reminders.completed',
      subscriptions_processed: subscriptions.length,
      emails_sent: emailsSent,
      ts: new Date().toISOString(),
    }))

    return NextResponse.json({ ok: true, emailsSent })
  } catch (err) {
    console.error(JSON.stringify({
      event: 'cron.subscription_reminders.error',
      message: err instanceof Error ? err.message : 'Unknown',
      ts: new Date().toISOString(),
    }))
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
