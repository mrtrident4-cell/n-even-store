'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { auth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from '@/lib/firebase'
import { ConfirmationResult, User } from 'firebase/auth'

interface Customer {
    id: string
    phone: string
    name: string
    email?: string
    firebaseUid?: string
}

interface CustomerContextType {
    customer: Customer | null
    firebaseUser: User | null
    isLoading: boolean
    isAuthenticated: boolean
    sendOtp: (phone: string, recaptchaContainerId: string) => Promise<{ success: boolean; error?: string }>
    verifyOtp: (otp: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>
    completeSignup: (name: string) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
    updateProfile: (data: Partial<Customer>) => Promise<void>
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

let confirmationResult: ConfirmationResult | null = null
let pendingPhone: string = ''

export function CustomerProvider({ children }: { children: ReactNode }) {
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Listen for Firebase auth state changes
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setFirebaseUser(user)
            if (user) {
                // Check if user exists in our database
                try {
                    const res = await fetch('/api/customer/me', {
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${await user.getIdToken()}`
                        }
                    })
                    if (res.ok) {
                        const data = await res.json()
                        setCustomer(data.customer)
                    }
                } catch (err) {
                    console.error('Error fetching customer:', err)
                }
            } else {
                setCustomer(null)
            }
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    async function sendOtp(phone: string, recaptchaContainerId: string) {
        try {
            pendingPhone = phone

            // Clear any existing recaptcha
            const container = document.getElementById(recaptchaContainerId)
            if (container) {
                container.innerHTML = ''
            }

            // Create recaptcha verifier
            const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA solved')
                }
            })

            // Send OTP
            confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier)

            return { success: true }
        } catch (error: any) {
            console.error('Send OTP error:', error)
            return { success: false, error: error.message || 'Failed to send OTP' }
        }
    }

    async function verifyOtp(otp: string) {
        try {
            if (!confirmationResult) {
                return { success: false, error: 'Please request OTP first' }
            }

            const result = await confirmationResult.confirm(otp)
            const user = result.user
            const idToken = await user.getIdToken()

            // Check if user exists in our database
            const res = await fetch('/api/customer/firebase-auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    phone: pendingPhone,
                    firebaseUid: user.uid
                })
            })

            const data = await res.json()

            if (res.ok && data.customer) {
                setCustomer(data.customer)
                return { success: true, isNewUser: false }
            } else if (data.isNewUser) {
                return { success: true, isNewUser: true }
            } else {
                return { success: false, error: data.error || 'Authentication failed' }
            }
        } catch (error: any) {
            console.error('Verify OTP error:', error)
            return { success: false, error: error.message || 'Invalid OTP' }
        }
    }

    async function completeSignup(name: string) {
        try {
            const user = auth.currentUser
            if (!user) {
                return { success: false, error: 'Not authenticated' }
            }

            const idToken = await user.getIdToken()

            const res = await fetch('/api/customer/firebase-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    phone: pendingPhone,
                    name,
                    firebaseUid: user.uid
                })
            })

            const data = await res.json()

            if (res.ok && data.customer) {
                setCustomer(data.customer)
                return { success: true }
            } else {
                return { success: false, error: data.error || 'Signup failed' }
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Signup failed' }
        }
    }

    async function logout() {
        try {
            await auth.signOut()
            await fetch('/api/customer/logout', {
                method: 'POST',
                credentials: 'include'
            })
            setCustomer(null)
            setFirebaseUser(null)
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    async function updateProfile(data: Partial<Customer>) {
        const user = auth.currentUser
        if (!user) return

        const idToken = await user.getIdToken()
        const res = await fetch('/api/customer/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            credentials: 'include',
            body: JSON.stringify(data)
        })
        if (res.ok) {
            const result = await res.json()
            setCustomer(result.customer)
        }
    }

    return (
        <CustomerContext.Provider value={{
            customer,
            firebaseUser,
            isLoading,
            isAuthenticated: !!firebaseUser && !!customer,
            sendOtp,
            verifyOtp,
            completeSignup,
            logout,
            updateProfile
        }}>
            {children}
        </CustomerContext.Provider>
    )
}

export function useCustomer() {
    const context = useContext(CustomerContext)
    if (!context) {
        throw new Error('useCustomer must be used within CustomerProvider')
    }
    return context
}
