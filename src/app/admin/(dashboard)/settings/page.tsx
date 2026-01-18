'use client'

import { useState, useEffect } from 'react'
import styles from './settings.module.css'
import { Save, Store, CreditCard, Truck, Mail, Phone } from 'lucide-react'

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        const res = await fetch('/api/admin/settings', {
            credentials: 'include'
        })
        const data = await res.json()
        setSettings(data.settings || {})
        setLoading(false)
    }

    function updateSetting(key: string, value: string) {
        setSettings(prev => ({ ...prev, [key]: value }))
        setSaved(false)
    }

    async function handleSave() {
        setSaving(true)
        await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(settings)
        })
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    if (loading) {
        return <div className={styles.loading}>Loading settings...</div>
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Settings</h1>
                    <p className={styles.subtitle}>Configure your store settings</p>
                </div>
                <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                    {saving ? 'Saving...' : saved ? 'Saved!' : <><Save size={18} /> Save Changes</>}
                </button>
            </header>

            <div className={styles.settingsGrid}>
                {/* Store Info */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Store size={20} />
                        <h2>Store Information</h2>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Store Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={settings.store_name || ''}
                            onChange={e => updateSetting('store_name', e.target.value)}
                            placeholder="N-EVEN"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Store Logo URL</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={settings.store_logo || ''}
                            onChange={e => updateSetting('store_logo', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>

                {/* Contact */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Mail size={20} />
                        <h2>Contact Information</h2>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Contact Email</label>
                        <div className={styles.inputWithIcon}>
                            <Mail size={16} />
                            <input
                                type="email"
                                className={styles.input}
                                value={settings.contact_email || ''}
                                onChange={e => updateSetting('contact_email', e.target.value)}
                                placeholder="support@neven.com"
                            />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Contact Phone</label>
                        <div className={styles.inputWithIcon}>
                            <Phone size={16} />
                            <input
                                type="text"
                                className={styles.input}
                                value={settings.contact_phone || ''}
                                onChange={e => updateSetting('contact_phone', e.target.value)}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>
                </div>

                {/* Currency & Tax */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <CreditCard size={20} />
                        <h2>Pricing & Tax</h2>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Currency</label>
                            <select
                                className={styles.select}
                                value={settings.currency || 'INR'}
                                onChange={e => updateSetting('currency', e.target.value)}
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Currency Symbol</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={settings.currency_symbol || '₹'}
                                onChange={e => updateSetting('currency_symbol', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>GST / Tax Percentage (%)</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={settings.tax_percentage || '18'}
                            onChange={e => updateSetting('tax_percentage', e.target.value)}
                            placeholder="18"
                        />
                    </div>
                </div>

                {/* Shipping */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Truck size={20} />
                        <h2>Shipping</h2>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Shipping Charge (₹)</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={settings.shipping_charge || '99'}
                            onChange={e => updateSetting('shipping_charge', e.target.value)}
                            placeholder="99"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Free Shipping Threshold (₹)</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={settings.free_shipping_threshold || '999'}
                            onChange={e => updateSetting('free_shipping_threshold', e.target.value)}
                            placeholder="999"
                        />
                        <p className={styles.hint}>Orders above this amount get free shipping</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
