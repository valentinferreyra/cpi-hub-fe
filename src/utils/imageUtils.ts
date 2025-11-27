export type ImageUploadType = 'url' | 'file';

export interface ImageUploadOptions {
  type: ImageUploadType;
  value: string;
  file?: File;
}

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const validProtocols = ['http:', 'https:'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    if (!validProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    const pathname = urlObj.pathname.toLowerCase();
    return validExtensions.some(ext => pathname.endsWith(ext)) || 
           pathname.includes('image') || 
           urlObj.searchParams.has('format');
  } catch {
    return false;
  }
};

export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image/');
};

export const isImageUrl = (str: string): boolean => {
  return str.startsWith('http://') || str.startsWith('https://');
};

export const processImage = async (options: ImageUploadOptions): Promise<string> => {
  const { type, value, file } = options;
  
  if (type === 'url') {
    if (!isValidImageUrl(value)) {
      throw new Error('URL de imagen no válida');
    }
    return value;
  }
  
  if (type === 'file' && file) {
    if (!isValidImageFile(file)) {
      throw new Error('Archivo de imagen no válido. Debe ser JPG, PNG, GIF o WebP y menor a 5MB');
    }
    return await convertFileToBase64(file);
  }
  
  throw new Error('Tipo de imagen no válido');
};

export const getBase64MimeType = (base64: string): string => {
  const match = base64.match(/^data:([^;]+);/);
  return match ? match[1] : 'image/jpeg';
};

export const compressBase64Image = async (
  base64: string, 
  quality: number = 0.8, 
  maxWidth: number = 800
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const mimeType = getBase64MimeType(base64);
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }
      }, mimeType, quality);
    };
    
    img.src = base64;
  });
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const cleanupImagePreview = (preview: string): void => {
  if (preview.startsWith('blob:')) {
    URL.revokeObjectURL(preview);
  }
};

export const getFileSizeString = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getBase64Size = (base64: string): number => {
  const base64Data = base64.split(',')[1];
  return Math.round((base64Data.length * 3) / 4);
};
