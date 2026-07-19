import {
  calculateDistance
} from "./optimization";

export function optimizeTSP(route) {
  let bestRoute = [...route];
  let improved = true;
  while (improved) {
    improved = false;
    for (
      let i = 1;
      i < bestRoute.length - 2;
      i++
    ) {
      for (
        let j = i + 1;
        j < bestRoute.length - 1;
        j++
      ) {
        const newRoute =
          [...bestRoute];
        const reversed =
          newRoute
            .slice(i, j + 1)
            .reverse();
        newRoute.splice(
          i,
          j - i + 1,
          ...reversed
        );
        const oldDistance = calculateTotalDistance(bestRoute);
        const newDistance = calculateTotalDistance(newRoute);
        if ( newDistance < oldDistance) {
          bestRoute = newRoute;
          improved = true;
        }
      }
    }
  }
  return bestRoute;
}

export function calculateTotalDistance(
  route
) {
  let total = 0;
  for (
    let i = 0;
    i < route.length - 1;
    i++
  ) {
    total += calculateDistance(
      route[i],
      route[i + 1]
    );
  }
  return total;
}