// Supabase Edge Function to send emails via Brevo
// File: supabase/functions/send-leave-email/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const payload = await req.json()
    // payload usually comes from Database Webhooks
    const record = payload.record

    // If it's a new leave request
    if (payload.type === 'INSERT' && payload.table === 'leave_requests') {
      await sendEmail(
        'admin@yourcompany.com', 
        'New Leave Request Submitted', 
        `A new leave request was submitted by employee ID: ${record.employee_id} for ${record.total_days} days.`
      )
    }

    // If a request was updated (approved/rejected)
    if (payload.type === 'UPDATE' && payload.table === 'leave_requests') {
      if (payload.old_record.status !== record.status) {
        // Find employee email using Supabase API
        // For simplicity, assuming you pass employee email or fetch it here.
        await sendEmail(
          'employee@yourcompany.com', // Replace with real employee email
          `Leave Request ${record.status}`, 
          `Your leave request for ${record.total_days} days has been ${record.status}.`
        )
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})

async function sendEmail(to: string, subject: string, textContent: string) {
  if (!BREVO_API_KEY) throw new Error("Brevo API Key not found");

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: "HRMS Leave Portal", email: "no-reply@yourcompany.com" },
      to: [{ email: to }],
      subject: subject,
      textContent: textContent,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to send email via Brevo');
  }
}
