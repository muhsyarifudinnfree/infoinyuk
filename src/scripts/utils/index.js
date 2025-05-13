export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export async function convertBase64ToBlob(base64, mimeType) {
  const response = await fetch(`data:${mimeType};base64,${base64}`);
  return await response.blob();
}