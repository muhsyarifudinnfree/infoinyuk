export async function getLocationName(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    } else {
      return 'Lokasi tidak dikenal';
    }
  } catch (error) {
    console.error('Failed to fetch location name:', error);
    return 'Gagal memuat nama lokasi';
  }
}
