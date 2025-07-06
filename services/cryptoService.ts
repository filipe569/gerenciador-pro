// Function to derive a key from a password using PBKDF2
const getKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

// Function to encrypt data
export const encryptData = async (data: object, password: string): Promise<string> => {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey(password, salt);
  const encodedData = enc.encode(JSON.stringify(data));

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  const encryptedContentArr = new Uint8Array(encryptedContent);
  const buff = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContentArr.byteLength);
  buff.set(salt, 0);
  buff.set(iv, salt.byteLength);
  buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);

  // btoa is safe here because we're encoding byte arrays, not arbitrary strings
  return btoa(String.fromCharCode.apply(null, Array.from(buff)));
};

// Function to decrypt data
export const decryptData = async (encryptedDataB64: string, password: string): Promise<object | null> => {
  try {
    // atob is safe here as it's the reverse of the above btoa
    const encryptedDataStr = atob(encryptedDataB64);
    const encryptedDataArr = new Uint8Array(encryptedDataStr.split('').map(c => c.charCodeAt(0)));

    const salt = encryptedDataArr.slice(0, 16);
    const iv = encryptedDataArr.slice(16, 16 + 12);
    const data = encryptedDataArr.slice(16 + 12);
    const key = await getKey(password, salt);

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedContent));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null; // Indicates wrong password or corrupted data
  }
};
