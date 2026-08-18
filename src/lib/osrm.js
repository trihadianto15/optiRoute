// Kecepatan rata-rata kendaraan (km/jam)
const AVERAGE_SPEED = 21;

export async function getOSRMRoute(route) {

  if (!route || route.length < 2) {
    return null;
  }

  try {

    const coordinates = route
      .map(point => `${point.longitude},${point.latitude}`)
      .join(";");

    const url =
      `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
      `?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("OSRM Error");
    }

    const data = await response.json();

    if (data.code !== "Ok") {
      return null;
    }

    const routeData = data.routes[0];

    const polyline =
      routeData.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );

    const segments = [];

    let totalTime = 0;

    routeData.legs.forEach((leg, index) => {

      const distance = leg.distance / 1000;

      // waktu dihitung dari jarak OSRM
      const duration =
        Math.round(
          (distance / AVERAGE_SPEED) * 60
        );

      totalTime += duration;

      segments.push({

        from: route[index].nama,

        to: route[index + 1].nama,

        distance,

        duration

      });

    });

    console.log("=================================");
    console.log("AVERAGE SPEED :", AVERAGE_SPEED);
    console.log("TOTAL DISTANCE :", routeData.distance / 1000);
    console.log("TOTAL TIME :", totalTime);
    console.log("SEGMENTS :", segments);
    console.log("=================================");

    return {

      polyline,

      totalDistance:
        routeData.distance / 1000,

      totalTime,

      segments

    };

  } catch (err) {

    console.error("OSRM ERROR :", err);

    return null;

  }

}


/**
 * Total waktu perjalanan
 */
export async function calculateRoadTime(route) {

  const result =
    await getOSRMRoute(route);

  if (!result) return 0;

  return result.totalTime;

}


/**
 * Detail tiap segmen
 */
export async function calculateRoadSegments(route) {

  const result =
    await getOSRMRoute(route);

  if (!result) return [];

  return result.segments;

}