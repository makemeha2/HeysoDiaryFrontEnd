export function formatThumbnailPreviewDataUrl(payload, contentType = 'image/jpeg') {
  if (!payload) return '';

  if (payload instanceof ArrayBuffer) {
    const bytes = new Uint8Array(payload);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);
    return `data:${contentType};base64,${base64}`;
  }

  if (ArrayBuffer.isView(payload)) {
    const bytes = new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);
    return `data:${contentType};base64,${base64}`;
  }

  if (typeof payload === 'string') {
    if (payload.startsWith('data:image/')) return payload;
    return `data:${contentType};base64,${payload}`;
  }

  if (Array.isArray(payload)) {
    if (payload.length === 0) return '';

    if (typeof payload[0] === 'string') {
      const base64 = payload.join('');
      if (!base64) return '';
      if (base64.startsWith('data:image/')) return base64;
      return `data:${contentType};base64,${base64}`;
    }

    if (typeof payload[0] === 'number') {
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);
      return `data:${contentType};base64,${base64}`;
    }
  }

  return '';
}
