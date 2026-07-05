import { useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
  useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

function FitBounds({ route }) {

  const map = useMap();

  useEffect(() => {

    if (route.length < 2) return;

    const bounds = L.latLngBounds(

      route.map(item => [
        item.latitude,
        item.longitude
      ])

    );

    map.fitBounds(bounds, {
      padding: [40, 40]
    });

  }, [route, map]);

  return null;

}

export default function RouteMap({

  route = [],
  allPoints = [],
  polyline = []

}) {

  const center =
    route.length > 0
      ? [
          route[0].latitude,
          route[0].longitude
        ]
      : [-6.8845, 106.7981];

  return (

    <div
      className="
        relative
        z-0
        w-full
        h-[400px]
        md:h-[600px]
        lg:h-[750px]
      "
    >

      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full rounded-xl"
      >

        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {route.map((point, index) => (

          <Marker
            key={index}
            position={[
              point.latitude,
              point.longitude
            ]}
          >

            <Tooltip
              permanent
              direction="top"
              offset={[0, -15]}
            >
              {index + 1}
            </Tooltip>

            <Popup>

              <b>{point.nama}</b>

              <br />

              Desa {point.desa}

              <br />

              RT {point.rt} RW {point.rw}

              {point.packageCount > 1 && (

                <>
                  <br />
                  📦 {point.packageCount} Paket
                </>

              )}

            </Popup>

          </Marker>

        ))}

        {polyline.length > 0 && (

          <Polyline
            positions={polyline}
            color="#2563eb"
            weight={6}
          />

        )}

        <FitBounds route={route} />

      </MapContainer>

    </div>

  );

}