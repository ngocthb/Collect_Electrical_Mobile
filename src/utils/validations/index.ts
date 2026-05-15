export const validateEmail = (email: string): string | null => {
  if (!email) return 'Vui lòng nhập email';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Email không hợp lệ';
  }

  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return 'Vui lòng nhập số điện thoại';

  const cleaned = phone.replace(/\s+/g, '');

  const phoneRegex =
    /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;

  if (!phoneRegex.test(cleaned)) {
    return 'Số điện thoại không hợp lệ';
  }

  return null;
};

export const validateFullName = (name: string): string | null => {
  if (!name || !name.trim()) return 'Vui lòng nhập tên người dùng';

  if (!name.trim().includes(' ')) {
    return 'Tên người dùng phải bao gồm họ và tên';
  }

  return null;
};

/**
 * Obfuscate / mask a phone number by replacing the last N digits with 'x'
 * Keeps non-digit characters in place (e.g. +84, spaces, punctuation)
 */
export const maskPhone = (p?: string, digitsToMask = 3): string => {
  if (!p) return '';
  const chars = p.split('');
  let toMask = digitsToMask;
  for (let i = chars.length - 1; i >= 0 && toMask > 0; i--) {
    if (/\d/.test(chars[i])) {
      chars[i] = 'x';
      toMask -= 1;
    }
  }
  return chars.join('');
};

export const getImageSizeInMB = (fileSize?: number): number => {
  if (!fileSize) return 0;
  return fileSize / (1024 * 1024);
};

export const validateImageSize = (
  fileSize: number | undefined,
  maxSizeMB: number = 10,
): boolean => {
  if (!fileSize) return false;
  const sizeMB = getImageSizeInMB(fileSize);

  return sizeMB < maxSizeMB;
};
