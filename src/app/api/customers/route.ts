/**
 * route.ts — POST /api/customers
 *
 * Proxy for customer registration. Forwards permitted fields only to the
 * Spensit API. The SPENSIT_API_KEY stays server-side.
 */

import { NextRequest, NextResponse } from 'next/server'
import { spensitApi } from '@/lib/api/client'

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as {
            customer_name?: string
            email_address?: string
            password?: string
            phone_number?: string
            billing_address?: string
            delivery_address?: string
            currency?: string
        }

        if (!body.customer_name || !body.email_address) {
            return NextResponse.json(
                { error: 'customer_name and email_address are required.' },
                { status: 400 }
            )
        }

        // After the guard above, customer_name and email_address are guaranteed strings.
        const result = await spensitApi.createCustomer({
            customer_name: body.customer_name,
            email_address: body.email_address,
            password: body.password,
            phone_number: body.phone_number,
            billing_address: body.billing_address,
            delivery_address: body.delivery_address,
            currency: body.currency,
        })
        return NextResponse.json(result)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed'
        console.error('Customer registration error:', message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
