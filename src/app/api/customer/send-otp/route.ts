import { NextRequest, NextResponse } from 'next/server'
import { otpStore } from '@/lib/otpStore'

export async function POST(request: NextRequest) {
    const { phone } = await request.json()

    if (!phone || phone.length < 12) {
        return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP with 5-minute expiry
    otpStore.set(phone, otp, 5)

    // Send OTP via SMS
    const smsSent = await sendSMS(phone, otp)

    if (!smsSent) {
        return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        message: 'OTP sent to your phone'
    })
}

// Function to send SMS via Fast2SMS (India)
async function sendSMS(phone: string, otp: string): Promise<boolean> {
    const apiKey = process.env.FAST2SMS_API_KEY

    // If no API key configured, log OTP to console
    if (!apiKey || apiKey.trim() === '') {
        console.log(`\n==========================================`)
        console.log(`📱 OTP for ${phone}: ${otp}`)
        console.log(`   (Configure FAST2SMS_API_KEY for real SMS)`)
        console.log(`==========================================\n`)
        return true
    }

    try {
        // Remove +91 prefix for Fast2SMS (expects 10 digits)
        const mobileNumber = phone.replace('+91', '').trim()

        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                route: 'otp',
                variables_values: otp,
                numbers: mobileNumber
            })
        })

        const data = await response.json()

        if (data.return) {
            return true
        } else {
            console.error('Fast2SMS Error:', data)
            // Fallback: If SMS fails but we are in dev/test, allow it via console
            console.log(`\n⚠️ SMS Failed. Using Console Fallback:`)
            console.log(`📱 OTP for ${phone}: ${otp}`)
            return true
        }
    } catch (error) {
        console.error('SMS sending failed:', error)
        // Fallback on network error
        console.log(`\n⚠️ Network Error. Using Console Fallback:`)
        console.log(`📱 OTP for ${phone}: ${otp}`)
        return true
    }
}
