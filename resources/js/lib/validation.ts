export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const phoneRegex = /^(\+63|0)?[9]\d{9}$/;

export function validateEmail(email: string): boolean {
    return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
    // Remove spaces and dashes for validation
    const cleaned = phone.replace(/[\s-]/g, '');
    return phoneRegex.test(cleaned);
}

export function validateRequired(value: string | number | File | File[] | undefined | null): boolean {
    if (value === undefined || value === null) {
        return false;
    }
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return true;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => {
        if (type.endsWith('/*')) {
            const baseType = type.split('/')[0];
            return file.type.startsWith(baseType);
        }
        return file.type === type;
    });
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

export function validateCoordinates(latitude: number, longitude: number): boolean {
    return (
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180 &&
        !isNaN(latitude) &&
        !isNaN(longitude)
    );
}

export function validateBoundary(
    latitude: number,
    longitude: number,
    boundary?: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): boolean {
    if (!boundary) {
        return true; // No boundary defined, allow all
    }
    return (
        latitude >= boundary.minLat &&
        latitude <= boundary.maxLat &&
        longitude >= boundary.minLng &&
        longitude <= boundary.maxLng
    );
}

export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format: 09XX XXX XXXX
    if (cleaned.length === 11 && cleaned.startsWith('09')) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    
    // Format: +63 9XX XXX XXXX
    if (cleaned.length === 12 && cleaned.startsWith('639')) {
        return `+63 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    
    return phone;
}
