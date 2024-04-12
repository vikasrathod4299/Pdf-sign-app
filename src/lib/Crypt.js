import * as CryptoJS from "crypto-js";

export const encrypt = (keys, value) => {
  var key = CryptoJS.enc.Utf8.parse(keys);
  var iv = CryptoJS.enc.Utf8.parse(keys);
  var encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(value.toString()),
    key,
    {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return encrypted.toString();
};

export const dcrypt = (keys, value) => {
  var key = CryptoJS.enc.Utf8.parse(keys);
  var iv = CryptoJS.enc.Utf8.parse(keys);
  var decrypted = CryptoJS.AES.decrypt(value, key, {
    keySize: 128 / 8,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};
