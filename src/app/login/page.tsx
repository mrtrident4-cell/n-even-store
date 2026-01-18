'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './auth.module.css'
import { useCustomer } from '@/contexts/CustomerContext'
import { ArrowRight, User, ArrowLeft } from 'lucide-react'

type AuthMode = 'phone' | 'otp' | 'signup'

export default function LoginPage() {
    const router = useRouter()
    const { sendOtp, verifyOtp, completeSignup, isAuthenticated } = useCustomer()

    const [mode, setMode] = useState<AuthMode>('phone')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/account')
        }
    }, [isAuthenticated, router])

    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number')
            return
        }

        setLoading(true)

        // Format phone with country code
        const fullPhone = `+91${phone}`
        const result = await sendOtp(fullPhone, 'recaptcha-container')

        setLoading(false)

        if (result.success) {
            setMode('otp')
        } else {
            setError(result.error || 'Failed to send OTP')
        }
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP')
            return
        }

        setLoading(true)
        const result = await verifyOtp(otp)
        setLoading(false)

        if (result.success) {
            if (result.isNewUser) {
                setMode('signup')
            } else {
                router.push('/account')
            }
        } else {
            setError(result.error || 'Invalid OTP')
        }
    }

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (!name.trim()) {
            setError('Please enter your name')
            return
        }

        setLoading(true)
        const result = await completeSignup(name)
        setLoading(false)

        if (result.success) {
            router.push('/account')
        } else {
            setError(result.error || 'Signup failed')
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Store
                </Link>

                <div className={styles.header}>
                    <h1>Welcome to N-EVEN</h1>
                    <p>
                        {mode === 'phone' && 'Enter your mobile number to continue'}
                        {mode === 'otp' && 'Enter the OTP sent to your phone'}
                        {mode === 'signup' && 'Complete your profile to continue'}
                    </p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {/* Hidden recaptcha container */}
                <div id="recaptcha-container"></div>

                {mode === 'phone' && (
                    <form onSubmit={handleSendOtp} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Mobile Number</label>
                            <div className={styles.phoneInput}>
                                <span className={styles.countryCode}>+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="Enter 10-digit number"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Sending...' : 'Get OTP'} <ArrowRight size={18} />
                        </button>
                    </form>
                )}

                {mode === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="6-digit OTP"
                                className={styles.otpInput}
                                autoFocus
                                maxLength={6}
                            />
                            <p className={styles.hint}>
                                OTP sent to +91 {phone}
                                <button type="button" onClick={() => setMode('phone')} className={styles.changeBtn}>
                                    Change
                                </button>
                            </p>
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Login'} <ArrowRight size={18} />
                        </button>
                        <button type="button" onClick={handleSendOtp} className={styles.resendBtn} disabled={loading}>
                            Resend OTP
                        </button>
                    </form>
                )}

                {mode === 'signup' && (
                    <form onSubmit={handleSignup} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Your Name</label>
                            <div className={styles.nameInput}>
                                <User size={20} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <p className={styles.signupNote}>
                            Creating account for +91 {phone}
                        </p>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
                        </button>
                    </form>
                )}

                <div className={styles.footer}>
                    <p>By continuing, you agree to our</p>
                    <div className={styles.legalLinks}>
                        <Link href="/terms">Terms of Service</Link>
                        <span>&</span>
                        <Link href="/privacy">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
