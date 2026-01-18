export interface Admin {
    id: string
    email: string
    name: string
    role: 'super_admin' | 'manager' | 'staff'
    permissions: AdminPermissions
    is_active: boolean
    last_login: string | null
    created_at: string
}

export interface AdminPermissions {
    products: boolean
    orders: boolean
    customers: boolean
    settings: boolean
    admins?: boolean
}

export interface Customer {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    is_blocked: boolean
    email_verified: boolean
    created_at: string
}

export interface CustomerAddress {
    id: string
    customer_id: string
    label: string
    address_line1: string
    address_line2: string | null
    city: string
    state: string
    postal_code: string
    country: string
    is_default: boolean
}

export interface Category {
    id: string
    name: string
    slug: string
    parent_id: string | null
    description: string | null
    image_url: string | null
    is_active: boolean
    sort_order: number
    created_at: string
    children?: Category[]
}

export interface Collection {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    is_active: boolean
    start_date: string | null
    end_date: string | null
    created_at: string
}

export interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    compare_price: number | null
    cost_price: number | null
    category_id: string | null
    category?: Category
    gender: 'men' | 'women' | 'kids' | 'unisex' | null
    is_active: boolean
    is_featured: boolean
    meta_title: string | null
    meta_description: string | null
    created_at: string
    updated_at: string
    images?: ProductImage[]
    variants?: ProductVariant[]
    collections?: Collection[]
}

export interface ProductImage {
    id: string
    product_id: string
    image_url: string
    alt_text: string | null
    is_primary: boolean
    sort_order: number
}

export interface ProductVariant {
    id: string
    product_id: string
    size: string
    color: string
    color_hex: string | null
    sku: string | null
    stock_quantity: number
    price_adjustment: number
    is_active: boolean
}

export interface Coupon {
    id: string
    code: string
    description: string | null
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    min_order_amount: number
    max_discount_amount: number | null
    usage_limit: number | null
    used_count: number
    is_active: boolean
    starts_at: string
    expires_at: string | null
    created_at: string
}

export interface Order {
    id: string
    order_number: string
    customer_id: string | null
    customer?: Customer
    status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
    subtotal: number
    discount_amount: number
    shipping_amount: number
    tax_amount: number
    total_amount: number
    coupon_id: string | null
    coupon_code: string | null
    payment_method: 'cod' | 'online' | 'upi' | 'card' | null
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    payment_id: string | null
    shipping_name: string | null
    shipping_phone: string | null
    shipping_address: string | null
    shipping_city: string | null
    shipping_state: string | null
    shipping_postal_code: string | null
    shipping_country: string
    customer_notes: string | null
    admin_notes: string | null
    created_at: string
    updated_at: string
    shipped_at: string | null
    delivered_at: string | null
    items?: OrderItem[]
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string | null
    variant_id: string | null
    product_name: string
    product_image: string | null
    size: string | null
    color: string | null
    quantity: number
    unit_price: number
    total_price: number
}

export interface StoreSetting {
    id: string
    key: string
    value: string | null
}

export interface DashboardStats {
    totalSalesToday: number
    totalSalesMonth: number
    totalOrders: number
    totalCustomers: number
    lowStockProducts: number
    pendingOrders: number
}

export interface CartItem {
    product: Product
    variant: ProductVariant
    quantity: number
}
