import crypto from 'crypto';

export interface QRCodeData {
  productId: number;
  farmName?: string;
  productName?: string;
  timestamp: number;
}

/**
 * Generates a unique QR code identifier for a product
 */
export function generateQRCode(productId: number, additionalData?: Partial<QRCodeData>): string {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');

  // Format: HV-{productId}-{timestamp}-{randomSuffix}
  return `HV-${productId}-${timestamp}-${randomSuffix}`;
}

/**
 * Parses a QR code to extract product information
 */
export function parseQRCode(qrCode: string): { productId: number; timestamp: number } | null {
  try {
    const parts = qrCode.split('-');

    if (parts.length >= 4 && parts[0] === 'HV') {
      const productId = parseInt(parts[1]);
      const timestamp = parseInt(parts[2]);

      if (!isNaN(productId) && !isNaN(timestamp)) {
        return { productId, timestamp };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Validates if a QR code has the correct format
 */
export function isValidQRCode(qrCode: string): boolean {
  return parseQRCode(qrCode) !== null;
}

/**
 * Generates QR code URL for use with QR code generation libraries
 * In a real implementation, this would integrate with a QR code service
 */
export function generateQRCodeURL(qrCode: string, size: number = 200): string {
  // Using a public QR code API for demonstration
  // In production, you might want to use a more reliable service or generate them locally
  const baseURL = 'https://api.qrserver.com/v1/create-qr-code/';
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: qrCode,
    format: 'png',
    margin: '10'
  });

  return `${baseURL}?${params.toString()}`;
}

/**
 * Creates QR code data with product and producer information
 */
export function createQRCodeData(
  productId: number,
  productName: string,
  farmName: string
): QRCodeData {
  return {
    productId,
    productName,
    farmName,
    timestamp: Date.now()
  };
}

/**
 * Generates a QR code with embedded product metadata
 * This creates a more informative QR code that includes product details
 */
export function generateDetailedQRCode(
  productId: number,
  productName: string,
  farmName: string
): string {
  const data = createQRCodeData(productId, productName, farmName);
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64');
  return `HV-DATA-${encoded}`;
}

/**
 * Parses a detailed QR code to extract all embedded information
 */
export function parseDetailedQRCode(qrCode: string): QRCodeData | null {
  try {
    if (qrCode.startsWith('HV-DATA-')) {
      const encoded = qrCode.replace('HV-DATA-', '');
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const data = JSON.parse(decoded) as QRCodeData;

      if (data.productId && data.timestamp) {
        return data;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
