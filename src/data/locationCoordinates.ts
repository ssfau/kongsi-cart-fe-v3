// Lat/Lng mapping for Malaysian districts and cities used in listings
export const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  // Selangor
  "Shah Alam": { lat: 3.0733, lng: 101.5185 },
  "Petaling Jaya": { lat: 3.1073, lng: 101.6067 },
  "Subang Jaya": { lat: 3.0565, lng: 101.5851 },
  "Klang": { lat: 3.0449, lng: 101.4455 },
  "Serdang": { lat: 3.0225, lng: 101.7131 },
  "Ampang": { lat: 3.1500, lng: 101.7667 },
  "Kajang": { lat: 2.9927, lng: 101.7909 },
  "Rawang": { lat: 3.3210, lng: 101.5769 },
  "Sepang": { lat: 2.6872, lng: 101.7414 },
  "Gombak": { lat: 3.2533, lng: 101.7328 },
  "Hulu Langat": { lat: 3.1081, lng: 101.8614 },
  "Hulu Selangor": { lat: 3.5503, lng: 101.6752 },
  "Kuala Selangor": { lat: 3.3500, lng: 101.2500 },
  "Sabak Bernam": { lat: 3.6833, lng: 100.9833 },
  "Kuala Langat": { lat: 2.8167, lng: 101.5167 },
  "Petaling": { lat: 3.1000, lng: 101.6500 },
  // KL
  "Kuala Lumpur": { lat: 3.1390, lng: 101.6869 },
  "Kepong": { lat: 3.2087, lng: 101.6328 },
  "Cheras": { lat: 3.1073, lng: 101.7328 },
  "Bukit Bintang": { lat: 3.1466, lng: 101.7108 },
  "Wangsa Maju": { lat: 3.1990, lng: 101.7336 },
  "Segambut": { lat: 3.1870, lng: 101.6643 },
  "Setiawangsa": { lat: 3.1820, lng: 101.7370 },
  "Titiwangsa": { lat: 3.1746, lng: 101.7004 },
  "Lembah Pantai": { lat: 3.1120, lng: 101.6601 },
  "Seputeh": { lat: 3.1160, lng: 101.6830 },
  "Bandar Tun Razak": { lat: 3.1030, lng: 101.7220 },
  "Batu": { lat: 3.2100, lng: 101.6830 },
  // Pahang
  "Kuantan": { lat: 3.8077, lng: 103.3260 },
  "Cameron Highlands": { lat: 4.4718, lng: 101.3792 },
  "Temerloh": { lat: 3.4511, lng: 102.4214 },
  "Bentong": { lat: 3.5225, lng: 101.9092 },
  "Raub": { lat: 3.7889, lng: 101.8567 },
  "Pekan": { lat: 3.4835, lng: 103.3957 },
  "Rompin": { lat: 2.7944, lng: 103.4877 },
  "Lipis": { lat: 4.1889, lng: 101.9408 },
  "Jerantut": { lat: 3.9367, lng: 102.3647 },
  "Bera": { lat: 3.2500, lng: 102.4500 },
  "Maran": { lat: 3.5833, lng: 102.7500 },
  // Perak
  "Ipoh": { lat: 4.5975, lng: 101.0901 },
  "Taiping": { lat: 4.8500, lng: 100.7333 },
  "Teluk Intan": { lat: 4.0225, lng: 101.0208 },
  "Sitiawan": { lat: 4.2167, lng: 100.7000 },
  "Kuala Kangsar": { lat: 4.7733, lng: 100.9358 },
  "Kampar": { lat: 4.3050, lng: 101.1533 },
  "Batu Gajah": { lat: 4.4697, lng: 101.0422 },
  "Seri Iskandar": { lat: 4.3500, lng: 100.9833 },
  "Tanjung Malim": { lat: 3.6879, lng: 101.5214 },
  "Gerik": { lat: 5.4333, lng: 101.1167 },
  // Johor
  "Johor Bahru": { lat: 1.4927, lng: 103.7414 },
  "Tebrau": { lat: 1.5386, lng: 103.7910 },
  "Pasir Gudang": { lat: 1.4725, lng: 103.9053 },
  "Batu Pahat": { lat: 1.8548, lng: 102.9325 },
  "Muar": { lat: 2.0442, lng: 102.5689 },
  "Kluang": { lat: 2.0251, lng: 103.3168 },
  "Pontian": { lat: 1.4867, lng: 103.3900 },
  "Kota Tinggi": { lat: 1.7381, lng: 103.8999 },
  "Segamat": { lat: 2.5144, lng: 102.8158 },
  "Mersing": { lat: 2.4312, lng: 103.8405 },
  "Kulai": { lat: 1.6564, lng: 103.5978 },
  "Iskandar Puteri": { lat: 1.4331, lng: 103.6252 },
  // Penang
  "George Town": { lat: 5.4141, lng: 100.3288 },
  "Butterworth": { lat: 5.3991, lng: 100.3638 },
  "Bukit Mertajam": { lat: 5.3631, lng: 100.4631 },
  "Balik Pulau": { lat: 5.3500, lng: 100.2167 },
  "Bayan Lepas": { lat: 5.2969, lng: 100.2618 },
  "Nibong Tebal": { lat: 5.1667, lng: 100.4500 },
  // Kedah
  "Alor Setar": { lat: 6.1248, lng: 100.3670 },
  "Sungai Petani": { lat: 5.6470, lng: 100.4878 },
  "Kulim": { lat: 5.3648, lng: 100.5621 },
  "Langkawi": { lat: 6.3500, lng: 99.8000 },
  // Kelantan
  "Kota Bharu": { lat: 6.1256, lng: 102.2385 },
  "Pasir Mas": { lat: 6.0500, lng: 102.1333 },
  "Tanah Merah": { lat: 5.8167, lng: 102.1500 },
  "Gua Musang": { lat: 4.8833, lng: 101.9667 },
  // Terengganu
  "Kuala Terengganu": { lat: 5.3117, lng: 103.1324 },
  "Kemaman": { lat: 4.2333, lng: 103.4167 },
  "Dungun": { lat: 4.7575, lng: 103.4178 },
  // Melaka
  "Melaka Tengah": { lat: 2.1896, lng: 102.2501 },
  "Alor Gajah": { lat: 2.3833, lng: 102.1500 },
  "Jasin": { lat: 2.3078, lng: 102.4278 },
  // N. Sembilan
  "Seremban": { lat: 2.7258, lng: 101.9424 },
  "Port Dickson": { lat: 2.5225, lng: 101.7964 },
  "Nilai": { lat: 2.8000, lng: 101.8000 },
  // Sabah
  "Kota Kinabalu": { lat: 5.9804, lng: 116.0735 },
  "Sandakan": { lat: 5.8402, lng: 118.1179 },
  "Tawau": { lat: 4.2498, lng: 117.8871 },
  // Sarawak
  "Kuching": { lat: 1.5535, lng: 110.3593 },
  "Miri": { lat: 4.3995, lng: 114.0118 },
  "Sibu": { lat: 2.2870, lng: 111.8308 },
  // Perlis
  "Kangar": { lat: 6.4414, lng: 100.1986 },
  "Arau": { lat: 6.4300, lng: 100.2700 },
  // Putrajaya & Labuan
  "Putrajaya": { lat: 2.9264, lng: 101.6964 },
  "Labuan": { lat: 5.2831, lng: 115.2308 },
};

// Default location: Central Klang Valley
export const DEFAULT_LOCATION = { lat: 3.1390, lng: 101.6869 };

// Haversine distance in km
export function getDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Resolve a listing's coordinates from district or state
export function getListingCoords(district?: string, state?: string) {
  if (district && locationCoordinates[district]) return locationCoordinates[district];
  if (state && locationCoordinates[state]) return locationCoordinates[state];
  return DEFAULT_LOCATION;
}
