export function calculateDistance(a, b) {
  const R = 6371;

  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;

  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 *
    Math.cos(lat1) *
    Math.cos(lat2);

  return 2 * R * Math.asin(Math.sqrt(h));
}


/**
 * NEAREST NEIGHBOR
 */
export function solveNearestNeighbor(locations) {
  if (!locations.length) return [];

  const unvisited = [...locations.slice(1)];
  const route = [locations[0]];
  let current = locations[0];

  while (unvisited.length) {

    let nearestIndex = 0;

    let nearestDistance =
      calculateDistance(
        current,
        unvisited[0]
      );

    for (let i = 1; i < unvisited.length; i++) {

      const distance =
        calculateDistance(
          current,
          unvisited[i]
        );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    current =
      unvisited.splice(
        nearestIndex,
        1
      )[0];

    route.push(current);
  }

  return route;
}


/**
 * Hitung estimasi waktu tempuh
 * Kecepatan rata-rata motor = 30 km/jam
 */
/**
 * Estimasi waktu perjalanan
 * Asumsi kecepatan kendaraan 30 km/jam
 */
export function calculateTravelTime(distance) {

  const speed = 15; // km/jam

  const minutes =
    Math.round((distance / speed) * 60);

  if (minutes < 60) {
    return `${minutes} menit`;
  }

  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${hour} jam ${minute} menit`;
}

/**
 * Hitung total estimasi waktu
 */
