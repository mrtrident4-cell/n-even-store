import { db } from './firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentData,
    QueryConstraint
} from 'firebase/firestore';

// Generic CRUD operations for Firestore

export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
}

export async function getDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
): Promise<T[]> {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

export async function addDocument(collectionName: string, data: DocumentData): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        created_at: new Date().toISOString()
    });
    return docRef.id;
}

export async function updateDocument(collectionName: string, docId: string, data: DocumentData): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
        ...data,
        updated_at: new Date().toISOString()
    });
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
}

// Collection names
export const COLLECTIONS = {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    CUSTOMERS: 'customers',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items',
    ADMINS: 'admins',
    COUPONS: 'coupons',
    COLLECTIONS: 'collections'
};

// Export Firestore query helpers
export { collection, doc, query, where, orderBy, limit, startAfter };
