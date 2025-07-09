/**
 * Client-side QR code utilities
 * Mirrors server-side functionality for frontend QR code handling
 */

export interface QRCodeData {
  productId: number;
  farmName?: string;
  productName?: string;
  timestamp: number;
}

/**
 * Generates a QR code display URL for showing QR codes visually
 * Uses a public QR code generation service
 */
export function generateQRCodeURL(qrCode: string, size: number = 200): string {
  // Using QR Server API for demonstration
  // In production, you might want to use a more reliable service
  const baseURL = 'https://api.qrserver.com/v1/create-qr-code/';
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: qrCode,
    format: 'png',
    margin: '10',
    color: '2D5016', // Green primary color
    bgcolor: 'FFFFFF'
  });

  return `${baseURL}?${params.toString()}`;
}

/**
 * Parses a simple QR code to extract product information
 * Format: HV-{productId}-{timestamp}-{randomSuffix}
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
    console.error('Error parsing QR code:', error);
    return null;
  }
}

/**
 * Validates if a QR code has the correct Hoja Verde format
 */
export function isValidQRCode(qrCode: string): boolean {
  if (!qrCode || typeof qrCode !== 'string') {
    return false;
  }

  // Check for simple format
  if (parseQRCode(qrCode) !== null) {
    return true;
  }

  // Check for detailed format
  if (parseDetailedQRCode(qrCode) !== null) {
    return true;
  }

  return false;
}

/**
 * Parses a detailed QR code to extract all embedded information
 * Format: HV-DATA-{base64EncodedJSON}
 */
export function parseDetailedQRCode(qrCode: string): QRCodeData | null {
  try {
    if (qrCode.startsWith('HV-DATA-')) {
      const encoded = qrCode.replace('HV-DATA-', '');
      const decoded = atob(encoded); // Use browser's built-in base64 decode
      const data = JSON.parse(decoded) as QRCodeData;

      if (data.productId && data.timestamp) {
        return data;
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing detailed QR code:', error);
    return null;
  }
}

/**
 * Extracts product ID from any valid Hoja Verde QR code format
 */
export function getProductIdFromQR(qrCode: string): number | null {
  // Try simple format first
  const simpleData = parseQRCode(qrCode);
  if (simpleData) {
    return simpleData.productId;
  }

  // Try detailed format
  const detailedData = parseDetailedQRCode(qrCode);
  if (detailedData) {
    return detailedData.productId;
  }

  return null;
}

/**
 * Creates a shareable QR code URL for a product
 * This generates a URL that points to the product detail page
 */
export function createShareableProductURL(productId: number, baseURL?: string): string {
  const base = baseURL || window.location.origin;
  return `${base}/producto/${productId}`;
}

/**
 * Generates a QR code URL that when scanned, opens the product page directly
 */
export function generateProductPageQRURL(productId: number, size: number = 200): string {
  const productURL = createShareableProductURL(productId);
  return generateQRCodeURL(productURL, size);
}

/**
 * Validates QR code format and returns a user-friendly error message
 */
export function validateQRCodeWithMessage(qrCode: string): { isValid: boolean; message: string } {
  if (!qrCode || qrCode.trim() === '') {
    return {
      isValid: false,
      message: 'Código QR vacío'
    };
  }

  if (!qrCode.startsWith('HV')) {
    return {
      isValid: false,
      message: 'Este no es un código QR de Hoja Verde'
    };
  }

  if (isValidQRCode(qrCode)) {
    return {
      isValid: true,
      message: 'Código QR válido'
    };
  }

  return {
    isValid: false,
    message: 'Formato de código QR inválido'
  };
}

/**
 * Simulates QR code scanning for demo purposes
 * Returns a promise that resolves with a demo QR code after a delay
 */
export function simulateQRScan(delayMs: number = 2000): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a demo QR code that would correspond to product ID 1
      const timestamp = Date.now();
      const demoQR = `HV-1-${timestamp}-demo`;
      resolve(demoQR);
    }, delayMs);
  });
}

/**
 * Formats QR code data for display purposes
 */
export function formatQRCodeInfo(qrCode: string): {
  code: string;
  productId: number | null;
  isDetailed: boolean;
  timestamp: Date | null;
  additionalInfo: Partial<QRCodeData> | null;
} {
  const productId = getProductIdFromQR(qrCode);
  const detailedData = parseDetailedQRCode(qrCode);
  const simpleData = parseQRCode(qrCode);

  let timestamp: Date | null = null;
  let additionalInfo: Partial<QRCodeData> | null = null;

  if (detailedData) {
    timestamp = new Date(detailedData.timestamp);
    additionalInfo = {
      farmName: detailedData.farmName,
      productName: detailedData.productName
    };
  } else if (simpleData) {
    timestamp = new Date(simpleData.timestamp);
  }

  return {
    code: qrCode,
    productId,
    isDetailed: !!detailedData,
    timestamp,
    additionalInfo
  };
}

/**
 * Creates a QR code for sharing a product with embedded metadata
 */
export function createProductSharingQR(
  productId: number,
  productName: string,
  farmName: string,
  size: number = 200
): string {
  const data: QRCodeData = {
    productId,
    productName,
    farmName,
    timestamp: Date.now()
  };

  const encoded = btoa(JSON.stringify(data)); // Use browser's built-in base64 encode
  const detailedQR = `HV-DATA-${encoded}`;

  return generateQRCodeURL(detailedQR, size);
}

/**
 * Extracts all available information from a QR code for display
 */
export function extractQRInfo(qrCode: string) {
  const validation = validateQRCodeWithMessage(qrCode);

  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.message,
      data: null
    };
  }

  const formatted = formatQRCodeInfo(qrCode);

  return {
    isValid: true,
    error: null,
    data: {
      productId: formatted.productId,
      isDetailed: formatted.isDetailed,
      timestamp: formatted.timestamp,
      farmName: formatted.additionalInfo?.farmName,
      productName: formatted.additionalInfo?.productName,
      displayCode: qrCode.length > 20 ? `${qrCode.substring(0, 20)}...` : qrCode
    }
  };
}
