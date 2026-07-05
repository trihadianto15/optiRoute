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

    if (data.code !== "Ok") return null;

    const routeData = data.routes[0];

    const polyline =
      routeData.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );

    const segments = [];

    routeData.legs.forEach((leg, index) => {

      segments.push({

        from: route[index].nama,

        to: route[index + 1].nama,

        distance: leg.distance / 1000,

        duration:
          Math.round(leg.duration / 60)

      });

    });

    return {

      polyline,

      totalDistance:
        routeData.distance / 1000,

      totalTime:
        Math.round(routeData.duration / 60),

      segments

    };

  } catch (err) {

    console.error(err);

    return null;

  }

}

export async function calculateRoadTime(route) {

  if (!route || route.length < 2) return 0;

  let totalDuration = 0;

  for (let i = 0; i < route.length - 1; i++) {

    const from = route[i];
    const to = route[i + 1];

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.longitude},${from.latitude};` +
      `${to.longitude},${to.latitude}` +
      `?overview=false`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === "Ok") {
      totalDuration += data.routes[0].duration;
    }
  }

  return Math.round(totalDuration / 60);
}

export async function calculateRoadSegments(route) {

  if (!route || route.length < 2) return [];

  const segments = [];

  for (let i = 0; i < route.length - 1; i++) {

    const from = route[i];
    const to = route[i + 1];

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.longitude},${from.latitude};` +
      `${to.longitude},${to.latitude}` +
      `?overview=false`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === "Ok") {

      segments.push({

        from: from.nama,

        to: to.nama,

        distance:
          data.routes[0].distance / 1000,

        duration:
          Math.round(data.routes[0].duration / 60)

      });

    }

  }

  return segments;

}

