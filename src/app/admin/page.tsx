/**
 * page.tsx (Admin)
 *
 * Redirects immediately to the Spensit admin dashboard. No UI is rendered.
 * Uses Next.js server-side redirect so the redirect happens before any
 * HTML is sent to the browser.
 */

import { redirect } from 'next/navigation'

export default function AdminPage() {
    redirect('https://my.spensit.com/getstarted')
}
