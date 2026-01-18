// Shared OTP storage for customer authentication
// In production, replace with Redis or database storage

interface OtpEntry {
    otp: string
    expires: number
}

class OtpStore {
    private store = new Map<string, OtpEntry>()

    set(phone: string, otp: string, expiryMinutes: number = 5) {
        this.store.set(phone, {
            otp,
            expires: Date.now() + expiryMinutes * 60 * 1000
        })
    }

    verify(phone: string, otp: string): boolean {
        const entry = this.store.get(phone)

        if (!entry) return false
        if (Date.now() > entry.expires) {
            this.store.delete(phone)
            return false
        }
        if (entry.otp !== otp) return false

        return true
    }

    delete(phone: string) {
        this.store.delete(phone)
    }

    // For development: accept test OTP "123456"
    verifyWithTestOtp(phone: string, otp: string): boolean {
        if (process.env.NODE_ENV === 'development' && otp === '123456') {
            return true
        }
        return this.verify(phone, otp)
    }
}

// Singleton instance
export const otpStore = new OtpStore()
