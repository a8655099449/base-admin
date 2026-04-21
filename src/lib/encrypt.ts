import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

const publicKey =
  'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANL378k3RiZHWx5AfJqdH9xRNBmD9wGD\n' +
  '2iRe41HdTNF8RUhNnHit5NpMNtGL0NPTSSpPjjI1kJfVorRvaQerUgkCAwEAAQ==';

/** RSA 加密 */
export const rsaEncrypt = (data: string) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(data) || '';
};

const key = `JypTnXc7J2z31SrL`;

// 加密 注意：key要和后端一致
export const encode = (data: string) => {
  const KEY = key;
  const keyHex = CryptoJS.enc.Utf8.parse(KEY);
  const word = CryptoJS.enc.Utf8.parse(data);
  const option = { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 };
  const encrypted = CryptoJS.DES.encrypt(word, keyHex, option);
  return encrypted.toString();
};

// 解密 注意：key要和后端一致
export const decode = (data: string) => {
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const option = { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 };
  const decrypted = CryptoJS.DES.decrypt(data, keyHex, option);

  return decrypted.toString(CryptoJS.enc.Utf8);
};

/**AES 加密 */
export const encodeAES = (data: unknown) => {
  const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
  const ivUtf8 = CryptoJS.enc.Utf8.parse(key);
  const option = { iv: ivUtf8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
  const encrypted = CryptoJS.AES.encrypt(String(data), keyUtf8, option);
  return encrypted.toString();
};

/**AES 解密 */
export const decodeAES = (data: string) => {
  try {
    const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
    const ivUtf8 = CryptoJS.enc.Utf8.parse(key);
    const option = { iv: ivUtf8, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
    const decrypted = CryptoJS.AES.decrypt(String(data), keyUtf8, option);
    const result = decrypted.toString(CryptoJS.enc.Utf8);

    // 判断是否成功解密（为空字符串也可能是失败）
    if (!result) {
      return data;
    }

    return result;
  } catch (_e) {
    return data;
  }
};
