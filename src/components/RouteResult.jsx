export default function RouteResult({
  route = [],
  totalDistance = 0,
  totalTime = 0,
  segmentDistances = [],
  updateStatus
}) {

  function formatDuration(minutes) {

    if (!minutes || minutes <= 0) {
      return "-";
    }

    if (minutes < 60) {
      return `${minutes} menit`;
    }

    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    if (minute === 0) {
      return `${hour} jam`;
    }

    return `${hour} jam ${minute} menit`;

  }

  return (

    <div className="mt-4">

      {/* Ringkasan */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-xs text-slate-500">
            Total Titik
          </div>

          <div className="text-2xl font-bold text-blue-700">
            {route.length}
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-xs text-slate-500">
            Total Jarak
          </div>

          <div className="text-2xl font-bold text-green-700">
            {Number(totalDistance).toFixed(2)} km
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="text-xs text-slate-500">
            Estimasi Waktu
          </div>

          <div className="text-xl font-bold text-yellow-700">
            {formatDuration(totalTime)}
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-4">
          <div className="text-xs text-slate-500">
            Status
          </div>

          <div className="text-xl font-bold text-orange-600">
            Optimal
          </div>
        </div>

      </div>

      <h3 className="font-bold text-xl mb-4">
        🚚 Urutan Rute Pengiriman
      </h3>

      {route.map((r, i) => {

        const distance =
          i === 0
            ? 0
            : segmentDistances[i - 1]?.distance || 0;

        const duration =
          i === 0
            ? 0
            : segmentDistances[i - 1]?.duration || 0;

        return (

          <div
            key={i}
            className="
              bg-white
              border
              rounded-2xl
              shadow-sm
              p-4
              mb-4
            "
          >

            <div className="flex justify-between items-start">

              <div>

                <div className="font-bold text-lg">
                  {i + 1}. {r.nama}
                </div>

                {r.packageCount > 1 && (

                  <div className="inline-block mt-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    📦 {r.packageCount} Paket
                  </div>

                )}

                {r.desa && (

                  <div className="text-blue-600 font-medium">
                    Desa {r.desa}
                  </div>

                )}

                <div className="text-slate-500 text-sm">
                  RT {r.rt} RW {r.rw}
                </div>

                {i > 0 && (

                  <div className="mt-3 text-sm">

                    <div>
                      📍 Dari titik sebelumnya :
                      <b> {distance.toFixed(2)} km</b>
                    </div>

                    <div>
                      ⏱ Estimasi :
                      <b> {formatDuration(duration)}</b>
                    </div>

                  </div>

                )}

              </div>

              {r.type !== "gudang" && (

                r.status !== "sudah" ? (

                  <button
                    onClick={() =>
                      updateStatus(
                        r.uniqueId,
                        "sudah"
                      )
                    }
                    className="
                      bg-green-600
                      hover:bg-green-700
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      text-sm
                    "
                  >
                    Sudah Diantar
                  </button>

                ) : (

                  <span className="text-green-600 font-bold">
                    ✅ Selesai
                  </span>

                )

              )}

            </div>

            {i < route.length - 1 &&
              segmentDistances[i] && (

              <div
                className="
                  mt-4
                  bg-blue-50
                  rounded-xl
                  p-3
                  text-sm
                  text-blue-700
                "
              >

                ➜ Ke tujuan berikutnya

                <br />

                Jarak :

                <b>
                  {" "}
                  {segmentDistances[i].distance.toFixed(2)} km
                </b>

                <br />

                Estimasi :

                <b>
                  {" "}
                  {formatDuration(
                    segmentDistances[i].duration
                  )}
                </b>

              </div>

            )}

            {i === route.length - 1 && (

              <div
                className="
                  mt-4
                  bg-green-50
                  rounded-xl
                  p-3
                  text-green-700
                  font-medium
                "
              >
                ✅ Tujuan terakhir telah dicapai
              </div>

            )}

          </div>

        );

      })}

    </div>

  );

}