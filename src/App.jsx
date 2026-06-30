import { useState, useCallback, useEffect } from "react";

import UploadSection from "./components/UploadSection";
import ProcessingStatus from "./components/ProcessingStatus";
import OCRResult from "./components/OCRResult";
import RouteResult from "./components/RouteResult";
import RouteMap from "./components/RouteMap";
import DashboardStats from "./components/DashboardStats";
import UnmatchedResult from "./components/UnmatchedResult";

import axios from "axios";

import {
  GUDANG_LOCATION,
  matchAddressToDatabase
} from "./lib/mockData";

import {
  solveNearestNeighbor,
  calculateRouteDistance,
  calculateSegmentDistances,
  calculateTotalTravelTime,
  calculateTravelTime
} from "./lib/optimization";

import {
  optimizeTSP
} from "./lib/tsp";

import {
  extractTextFromImage,
  normalizeText
} from "./lib/ocr";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {

  const [uploads, setUploads] = useState([]);
  const [database, setDatabase] = useState([]);

  const [processingStatus, setProcessingStatus] =
    useState(0);

  const [ocrHistory, setOcrHistory] =
    useState([]);

  const [allPoints, setAllPoints] =
    useState([]);

  const [fullRoute, setFullRoute] =
    useState([]);

  const [segmentDistances,
    setSegmentDistances] =
    useState([]);

  const [totalDistance,
    setTotalDistance] =
    useState(0);

  const [totalTime,
    setTotalTime] =
    useState(0);

  const [totalPackages,
    setTotalPackages] =
    useState(0);

  const [unmatchedData,
    setUnmatchedData] =
    useState([]);

  const [activeTab, setActiveTab] =
  useState("dashboard");

  /**
   * LOAD DATABASE MYSQL
   */
  useEffect(() => {

  async function loadDatabase() {

    try {

      const response = await axios.get(
        `${API_URL}/route_optimization`
      );

      const formattedData = response.data.map((loc) => ({
        ...loc,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        rt: Number(loc.rt),
        rw: Number(loc.rw),
        type: "delivery"
      }));

      setDatabase(formattedData);

    } catch (error) {

      console.error(
        "Gagal mengambil data:",
        error
      );

    }

  }

  loadDatabase();

}, []);

  /**
   * UPDATE STATUS PAKET
   */
  const updateStatus = async (
  uniqueId,
  status
) => {

  try {

    const selectedPoint =
      fullRoute.find(
        item => item.uniqueId === uniqueId
      );

    if (!selectedPoint) return;

    await axios.put(
      `${API_URL}/route_optimization/${selectedPoint.id}/status`,
      {
        status
      }
    );

    setFullRoute((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId
          ? {
              ...item,
              status
            }
          : item
      )
    );

  } catch (error) {

    console.error(
      "Gagal update status:",
      error
    );

  }

};

  /**
   * OCR + MATCHING + OPTIMASI
   */
const startSimulation =
  useCallback(async () => {

    if (uploads.length === 0) {

      alert(
        "Upload gambar atau input alamat terlebih dahulu"
      );

      return;
    }

    try {

      setProcessingStatus(1);

      const newTexts = [];
      const matchedLocations = [];
      const unmatchedFiles = [];

      for (const item of uploads) {

        let cleanText = "";

        /**
         * INPUT MANUAL
         */
        if (
          item.type === "manual"
        ) {

          cleanText =
            normalizeText(
              item.text
            );

          console.log(
            "MANUAL:",
            cleanText
          );

        }

        /**
         * OCR GAMBAR
         */
        else {

          setProcessingStatus(2);

          const ocrText =
            await extractTextFromImage(
              item.file
            );

          cleanText =
            normalizeText(
              ocrText
            );

          console.log(
            "OCR:",
            cleanText
          );

        }

        newTexts.push({

          text: cleanText,

          source:
            item.type

        });

        /**
         * MATCHING
         */
setProcessingStatus(3);

const matched =
  matchAddressToDatabase(
    cleanText,
    database
  );

if (matched) {

  /**
   * Cek apakah titik sudah ada
   */
  const existingPoint =
    allPoints.find(
      p =>
        p.rt === matched.rt &&
        p.rw === matched.rw &&
        p.desa === matched.desa &&
        p.nama === matched.nama
    ) ||

    matchedLocations.find(
      p =>
        p.rt === matched.rt &&
        p.rw === matched.rw &&
        p.desa === matched.desa &&
        p.nama === matched.nama
    );

  if (existingPoint) {

    /**
     * Paket tujuan sama
     */
    existingPoint.packageCount =
      (existingPoint.packageCount || 1) + 1;

    existingPoint.packageNames = [

      ...(existingPoint.packageNames || []),

      item.type === "manual"
        ? "Input Manual"
        : item.file.name

    ];

    console.log(
      "Paket tujuan sama:",
      existingPoint.nama,
      existingPoint.desa,
      existingPoint.packageCount
    );

  } else {

    /**
     * Titik baru
     */
    matchedLocations.push({

      ...matched,

      uniqueId:
        Date.now() + Math.random(),

      imageName:
        item.type === "manual"
          ? "Input Manual"
          : item.file.name,

      source:
        item.type,

      status:
        "belum",

      packageCount: 1,

      packageNames: [

        item.type === "manual"
          ? "Input Manual"
          : item.file.name

      ]

    });

  }

} else {

  unmatchedFiles.push({

    imageName:
      item.type === "manual"
        ? "Input Manual"
        : item.file.name,

    source:
      item.type,

    ocrText:
      cleanText

  });

}
}

      /**
       * SIMPAN HISTORY OCR
       */
      setOcrHistory((prev) => [

        ...prev,

        ...newTexts

      ]);

      /**
       * DATA GAGAL MATCHING
       */
      setUnmatchedData((prev) => [

        ...prev,

        ...unmatchedFiles

      ]);

      if (
        matchedLocations.length === 0
      ) {

        alert(
          "Tidak ada alamat yang cocok dengan database"
        );

        setProcessingStatus(0);

        return;
      }

      /**
       * GABUNGKAN DATA LAMA + BARU
       */
      const updatedPoints = [

        ...allPoints,

        ...matchedLocations

      ];

      setAllPoints(
        updatedPoints
      );

      /**
       * TOTAL PAKET
       */
      setTotalPackages(
        updatedPoints.length
      );

      /**
       * NEAREST NEIGHBOR
       */
      setProcessingStatus(4);

      const nnRoute =
        solveNearestNeighbor([

          GUDANG_LOCATION,

          ...updatedPoints

        ]);

      console.log(
        "Nearest Neighbor:",
        nnRoute
      );

      /**
       * TSP 2-OPT
       */
      setProcessingStatus(5);

      const optimizedRoute =
        optimizeTSP(
          nnRoute
        );

      console.log(
        "TSP:",
        optimizedRoute
      );

      setFullRoute(
        optimizedRoute
      );

      /**
       * JARAK ANTAR TITIK
       */
      const segments =
        calculateSegmentDistances(
          optimizedRoute
        );

      setSegmentDistances(
        segments
      );

      /**
       * TOTAL JARAK
       */
      const total =
        calculateRouteDistance(
          optimizedRoute
        );

      setTotalDistance(total);

      const estimatedTime =
        calculateTotalTravelTime(total);

      setTotalTime(
        estimatedTime
      );

      /**
       * SIMPAN HISTORY
       */
      try {

      await axios.post(
        `${API_URL}/route_history`,{

            total_titik:
              updatedPoints.length,

            total_jarak:
              total

          }
        );

      } catch (error) {

        console.error(
          "Gagal simpan history:",
          error
        );

      }

      /**
       * SELESAI
       */
      setProcessingStatus(6);

    } catch (error) {

      console.error(error);

      alert(
        "Proses OCR gagal"
      );

      setProcessingStatus(0);

    }

  }, [
    uploads,
    database,
    allPoints
  ]);


return (

  <div className="min-h-screen bg-slate-100">

    {/* HEADER */}

    <header
      className="
        bg-gradient-to-r
        from-blue-600
        to-indigo-700
        text-white
        p-5
        shadow-lg
      "
    >
      <h1
        className="
          text-2xl
          md:text-3xl
          font-bold
        "
      >
        📦 Sistem Optimasi Rute Pengiriman
      </h1>

      <p className="opacity-90">
        Dynamic Coordinate Optimization
      </p>
    </header>

    {/* DASHBOARD STATS */}

    <DashboardStats
      uploads={uploads}
      allPoints={allPoints}
      totalDistance={totalDistance}
      totalPackages={totalPackages}
    />

    <div className="px-4 pb-4">

      <div
        className="
          flex
          flex-col
          lg:flex-row
          gap-4
        "
      >

        {/* SIDEBAR */}

        <div
          className="
            w-full
            lg:w-1/4
            bg-white
            rounded-2xl
            shadow-lg
            p-5
          "
        >

          {/* MENU */}

          <div className="mb-5">

            <button
              onClick={() =>
                setActiveTab(
                  "dashboard"
                )
              }
              className={`
                w-full
                p-3
                rounded-xl
                mb-2
                text-left
                font-medium
                ${
                  activeTab ===
                  "dashboard"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100"
                }
              `}
            >
              📊 Dashboard
            </button>

            <button
              onClick={() =>
                setActiveTab("ocr")
              }
              className={`
                w-full
                p-3
                rounded-xl
                text-left
                font-medium
                ${
                  activeTab ===
                  "ocr"
                    ? "bg-green-600 text-white"
                    : "bg-slate-100"
                }
              `}
            >
              📝 Hasil OCR
            </button>

          </div>

          {/* DASHBOARD */}

          {activeTab ===
            "dashboard" && (

            <>

              <UploadSection
                uploads={uploads}
                setUploads={
                  setUploads
                }
              />

              <button
                onClick={
                  startSimulation
                }
                className="
                  w-full
                  mt-5
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  py-3
                  rounded-xl
                "
              >
                Mulai Optimasi
              </button>

              <ProcessingStatus
                processingStatus={
                  processingStatus
                }
              />
            </>

          )}

          {/* TAB OCR */}

          {activeTab === "ocr" && (

            <>

              <div
                className="
                  mb-4
                  p-3
                  rounded-xl
                  bg-blue-50
                "
              >
                <h3 className="font-bold">
                  Hasil OCR
                </h3>

                <p
                  className="
                    text-sm
                    text-slate-500
                  "
                >
                  Menampilkan
                  seluruh hasil OCR
                  dan alamat yang
                  gagal matching.
                </p>
              </div>

              <OCRResult
                extractedAddresses={
                  ocrHistory
                }
              />

              <UnmatchedResult
                unmatchedData={
                  unmatchedData
                }
              />

            </>

          )}

        </div>

        {/* MAP + HASIL RUTE */}

        <div
          className="
            w-full
            lg:w-3/4
            flex
            flex-col
            gap-4
          "
        >

          {/* PETA */}

          <div
            className="
              bg-white
              rounded-2xl
              shadow-lg
              p-4
            "
          >
            <RouteMap
              route={fullRoute}
              allPoints={allPoints}
            />
          </div>

          {/* HASIL RUTE */}

          <div
            className="
              bg-white
              rounded-2xl
              shadow-lg
              p-5
            "
          >
            <h2
              className="
                text-xl
                font-bold
                mb-4
              "
            >
              🚚 Hasil Optimasi Rute
            </h2>

            <RouteResult
              route={fullRoute}
              totalDistance={totalDistance}
              totalTime={calculateTravelTime(totalDistance)}
              segmentDistances={segmentDistances}
              updateStatus={updateStatus}
            />
          </div>

        </div>

      </div>

    </div>

  </div>

)};

