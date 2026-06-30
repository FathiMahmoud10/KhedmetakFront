import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface UserLocation {
  city: string;
  governorate: string;
  country: string;
  displayName: string;
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly STORAGE_KEY = 'user_location';

  constructor(private http: HttpClient) {}

  /** Returns cached location or requests a fresh one from the browser. */
  async getLocation(): Promise<UserLocation | null> {
    const cached = this.getCached();
    if (cached) return cached;
    return this.requestFresh();
  }

  getCached(): UserLocation | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /** Build a human-readable context string for the AI system prompt. */
  buildLocationContext(loc: UserLocation | null): string {
    if (!loc) return '';
    const parts: string[] = [];
    if (loc.city)        parts.push(`المدينة: ${loc.city}`);
    if (loc.governorate) parts.push(`المحافظة: ${loc.governorate}`);
    return parts.length
      ? `\n\n[معلومات الموقع الجغرافي للمستخدم — استخدمها لتوجيهه لأقرب مكتب أو فرع]\n${parts.join(' — ')}`
      : '';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  private requestFresh(): Promise<UserLocation | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc = await this.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (loc) {
            try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loc)); } catch {}
          }
          resolve(loc);
        },
        () => resolve(null),      // user denied / error
        { timeout: 8000, maximumAge: 60 * 60 * 1000 }
      );
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<UserLocation | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`;
      const data: any = await firstValueFrom(
        this.http.get(url, { headers: { 'Accept-Language': 'ar' } })
      );
      const addr = data?.address ?? {};
      return {
        lat,
        lng,
        city:        addr.city || addr.town || addr.village || addr.suburb || '',
        governorate: addr.state || addr.county || '',
        country:     addr.country || 'مصر',
        displayName: data?.display_name || '',
      };
    } catch {
      return null;
    }
  }
}
