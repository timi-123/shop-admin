// lib/services/vendorCache.ts (NEW - Centralized caching)
class VendorCacheService {
  private cache = new Map<string, any>();
  private cacheTime = new Map<string, number>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(userId: string, type: 'vendor' | 'products' | 'collections' | 'orders', vendorId?: string): string {
    if (type === 'vendor') {
      return `vendor_${userId}`;
    }
    return `${type}_${vendorId}`;
  }

  private isValidCache(key: string): boolean {
    const time = this.cacheTime.get(key);
    return time ? (Date.now() - time) < this.CACHE_DURATION : false;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheTime.set(key, Date.now());
    
    // Also set in localStorage as backup
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_time`, Date.now().toString());
  }

  private getCache(key: string): any | null {
    // Check memory cache first
    if (this.isValidCache(key)) {
      return this.cache.get(key);
    }

    // Check localStorage as fallback
    const localData = localStorage.getItem(key);
    const localTime = localStorage.getItem(`${key}_time`);
    
    if (localData && localTime && (Date.now() - parseInt(localTime)) < this.CACHE_DURATION) {
      const data = JSON.parse(localData);
      // Restore to memory cache
      this.cache.set(key, data);
      this.cacheTime.set(key, parseInt(localTime));
      return data;
    }

    return null;
  }

  clearCache(userId: string): void {
    const keysToRemove = Array.from(this.cache.keys()).filter(key => key.includes(userId));
    keysToRemove.forEach(key => {
      this.cache.delete(key);
      this.cacheTime.delete(key);
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_time`);
    });
  }

  async getVendor(userId: string): Promise<any> {
    const key = this.getCacheKey(userId, 'vendor');
    
    // Check cache first
    const cached = this.getCache(key);
    if (cached) {
      console.log("🟢 Using cached vendor data");
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      console.log("⏳ Waiting for pending vendor request");
      return this.pendingRequests.get(key);
    }

    // Make new request
    console.log("🔴 Making new vendor API request");
    const request = fetch("/api/vendors/my-vendor", { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch vendor: ${res.status}`);
        }
        const data = await res.json();
        this.setCache(key, data);
        return data;
      })
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  async getVendorData(userId: string, vendorId: string, type: 'products' | 'collections' | 'orders'): Promise<any> {
    const key = this.getCacheKey(userId, type, vendorId);
    
    // Check cache first
    const cached = this.getCache(key);
    if (cached) {
      console.log(`🟢 Using cached ${type} data`);
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      console.log(`⏳ Waiting for pending ${type} request`);
      return this.pendingRequests.get(key);
    }

    // Make new request
    console.log(`🔴 Making new ${type} API request`);
    const request = fetch(`/api/vendors/${vendorId}/${type}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch ${type}: ${res.status}`);
        }
        const data = await res.json();
        this.setCache(key, data);
        return data;
      })
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  invalidateVendorData(userId: string, vendorId?: string): void {
    if (vendorId) {
      ['products', 'collections', 'orders'].forEach(type => {
        const key = this.getCacheKey(userId, type as any, vendorId);
        this.cache.delete(key);
        this.cacheTime.delete(key);
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_time`);
      });
    }
    
    const vendorKey = this.getCacheKey(userId, 'vendor');
    this.cache.delete(vendorKey);
    this.cacheTime.delete(vendorKey);
    localStorage.removeItem(vendorKey);
    localStorage.removeItem(`${vendorKey}_time`);
  }
}

export const vendorCache = new VendorCacheService();