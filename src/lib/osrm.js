export async function getOSRMRoute(route) {

  if (!route || route.length < 2)
    return [];

  let fullRoute = [];

  try {

    for (let i = 0; i < route.length - 1; i++) {

      const from = route[i];
      const to = route[i + 1];

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${from.longitude},${from.latitude};` +
        `${to.longitude},${to.latitude}` +
        `?overview=full&geometries=geojson`;

      const response =
        await fetch(url);

      if (!response.ok)
        continue;

      const data =
        await response.json();

      if (
        data.code !== "Ok" ||
        !data.routes.length
      ) {
        continue;
      }

      const segment =
        data.routes[0]
          .geometry
          .coordinates
          .map(
            ([lng, lat]) => [lat, lng]
          );

      /**
       * Hindari titik pertama dobel
       */
      if (i > 0)
        segment.shift();

      fullRoute.push(
        ...segment
      );

    }

    return fullRoute;

  } catch (err) {

    console.error(
      "OSRM Error:",
      err
    );

    return [];

  }

}