/**
 * page.tsx (Checkout)
 *
 * The checkout flow is handled entirely through the CartDrawer slide-in panel
 * which calls the API and redirects to SpensPay. This page redirects users
 * who land here (e.g. via old bookmarks) back to the shop.
 */

import { redirect } from 'next/navigation'

export default function CheckoutPage() {
    redirect('/shop')
}
