// File对象 → Base64
export function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); // 结果格式: "data:image/png;base64,..."
  });
}

// Base64 → File对象
export function base64ToImage(base64) {
  const img = new Image();
  img.src = base64; // 直接赋值Base64字符串
  return new Promise((resolve) => {
    img.onload = () => resolve(img);
  });
}

// Image对象 → Base64
export function imageToBase64(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
}

// Image对象 → 转二进制流（Blob）
export function imageToBlob(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.8);
  })
}

// File对象 → 二进制流
export function fileToBlob(file) {
  // File对象本身是Blob的子类，可直接使用
  // const arrayBuffer = await file.arrayBuffer(); // 转为ArrayBuffer
  // const uint8Array = new Uint8Array(arrayBuffer);    // 转为Uint8Array
  // 或者使用FileReader转换为Blob
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const blob = new Blob([reader.result], { type: file.type });
      resolve(blob);
    };
  });
}

// 二进制流 → Base64
export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary); // 原生Base64编码
}

// Base64 → File对象
export function base64ToFile(base64, filename) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}