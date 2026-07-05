import {
  Camera,
  Images,
  Upload,
  Trash2,
  PencilLine,
  X
} from "lucide-react";

import {
  useRef,
  useState
} from "react";

export default function UploadSection({
  uploads,
  setUploads,
  database
}) {

  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const [showModal, setShowModal] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [mode, setMode] =
    useState("upload");

  const [selectedDesa,
      setSelectedDesa] =
      useState("");

  const [selectedRT,
      setSelectedRT] =
      useState("");

  const [selectedRW,
      setSelectedRW] =
      useState("");

  const desaList = [
    ...new Set(
        database.map(item => item.desa)
    )
];

const rtList = [
    ...new Set(
        database
            .filter(item =>
                item.desa === selectedDesa
            )
            .map(item => item.rt)
    )
];

const rwList = [
    ...new Set(
        database
            .filter(item =>
                item.desa === selectedDesa &&
                Number(item.rt) === Number(selectedRT)
            )
            .map(item => item.rw)
    )
];

  const handleFileChange = (e) => {

    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const newUploads =
      files.map((file) => ({
        type: "image",
        file,
        preview:
          URL.createObjectURL(file)
      }));

    setUploads((prev) => [
      ...prev,
      ...newUploads
    ]);

    e.target.value = "";
  };

  const addManualAddress = () => {

    if (
        !selectedDesa ||
        !selectedRT ||
        !selectedRW
    ) {
        alert("Lengkapi Desa, RT dan RW");
        return;
    }

    const selectedLocation =
        database.find(item =>
            item.desa === selectedDesa &&
            Number(item.rt) === Number(selectedRT) &&
            Number(item.rw) === Number(selectedRW)
        );

    if (!selectedLocation) {
        alert("Lokasi tidak ditemukan");
        return;
    }

    setUploads(prev => [

        ...prev,

        {
            type: "manual",
            location: selectedLocation
        }

    ]);

    setSelectedDesa("");
    setSelectedRT("");
    setSelectedRW("");

};

  const removeItem = (index) => {

    const target =
      uploads[index];

    if (
      target?.preview
    ) {
      URL.revokeObjectURL(
        target.preview
      );
    }

    setUploads((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  return (
    <>
      <div
        className="
        bg-white
        rounded-2xl
        shadow-md
        border
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
          📦 Input Paket
        </h2>

        {/* TAB */}
        <div className="flex gap-2 mb-4">

          <button
            onClick={() =>
              setMode("upload")
            }
            className={`
              flex-1
              p-3
              rounded-xl
              font-medium
              transition
              ${
                mode === "upload"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100"
              }
            `}
          >
            Upload
          </button>

          <button
            onClick={() =>
              setMode("manual")
            }
            className={`
              flex-1
              p-3
              rounded-xl
              font-medium
              transition
              ${
                mode === "manual"
                  ? "bg-green-600 text-white"
                  : "bg-slate-100"
              }
            `}
          >
            Manual
          </button>

        </div>

        {/* UPLOAD */}
        {mode === "upload" && (

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="
              w-full
              bg-gradient-to-r
              from-blue-600
              to-indigo-600
              text-white
              rounded-2xl
              p-5
              shadow-lg
              hover:scale-[1.02]
              transition
              flex
              flex-col
              items-center
              gap-2
            "
          >
            <Upload size={28} />

            <span>
              Upload Foto Paket
            </span>

            <span className="text-xs opacity-80">
              Kamera atau Galeri
            </span>

          </button>

        )}

        {/* MANUAL */}
        {mode === "manual" && (

        <div className="space-y-3">

        <select

        className="w-full border rounded-xl p-3"

        value={selectedDesa}

        onChange={(e)=>{

        setSelectedDesa(e.target.value);

        setSelectedRT("");

        setSelectedRW("");

        }}

        >

        <option value="">Pilih Desa</option>

        {desaList.map(desa=>(

        <option key={desa} value={desa}>

        {desa}

        </option>

        ))}

        </select>

        <select

        className="w-full border rounded-xl p-3"

        value={selectedRT}

        onChange={(e)=>{

        setSelectedRT(e.target.value);

        setSelectedRW("");

        }}

        disabled={!selectedDesa}

        >

        <option value="">Pilih RT</option>

        {rtList.map(rt=>(

        <option key={rt} value={rt}>

        RT {rt}

        </option>

        ))}

        </select>

        <select

        className="w-full border rounded-xl p-3"

        value={selectedRW}

        onChange={(e)=>

        setSelectedRW(e.target.value)

        }

        disabled={!selectedRT}

        >

        <option value="">Pilih RW</option>

        {rwList.map(rw=>(

        <option key={rw} value={rw}>

        RW {rw}

        </option>

        ))}

        </select>

        <button

        onClick={addManualAddress}

        className="w-full bg-green-600 text-white p-3 rounded-xl"

        >

        Tambah Tujuan

        </button>

        </div>

      )}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          hidden
          onChange={handleFileChange}
        />

        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileChange}
        />

        {/* LIST DATA */}
        {uploads.length > 0 && (

          <div className="mt-5">

            <div
              className="
                bg-green-50
                border
                border-green-200
                text-green-700
                p-3
                rounded-xl
                text-sm
                mb-4
              "
            >
              ✅ {uploads.length}
              {" "}
              data siap diproses
            </div>

            <div className="space-y-3">

              {uploads.map(
                (item, idx) => (

                  <div
                    key={idx}
                    className="
                      relative
                      border
                      rounded-xl
                      overflow-hidden
                      shadow-sm
                    "
                  >

                    {item.type ===
                    "image" ? (

                      <>
                        <img
                          src={
                            item.preview
                          }
                          alt=""
                          onClick={() =>
                            setSelectedImage(
                              item.preview
                            )
                          }
                          className="
                            w-full
                            h-32
                            object-cover
                            cursor-pointer
                          "
                        />

                        <div className="p-2 text-xs truncate">
                          {
                            item.file
                              .name
                          }
                        </div>
                      </>

                    ) : (

                      <div className="p-3 bg-slate-50">

                        <div className="flex items-center gap-2 mb-2">
                          <PencilLine
                            size={16}
                          />
                          <span className="font-medium">
                            Input Manual
                          </span>
                        </div>

                        <p className="text-sm">

                        <b>Desa</b> {item.location.desa}

                        <br/>

                        <b>RT</b> {item.location.rt}

                        <br/>

                        <b>RW</b> {item.location.rw}

                        <br/>

                        <b>Nama</b> {item.location.nama}

                        </p>

                      </div>

                    )}

                    <button
                      onClick={() =>
                        removeItem(idx)
                      }
                      className="
                        absolute
                        top-2
                        right-2
                        z-10
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        p-2
                        rounded-full
                        shadow-md
                      "
                    >
                      <Trash2
                        size={14}
                      />
                    </button>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>

      {/* MODAL PILIH SUMBER */}
      {showModal && (

        <div
          className="
          fixed
          inset-0
          bg-black/50
          backdrop-blur-sm
          flex
          items-center
          justify-center
          z-[9999]
        "
        >

          <div
            className="
            bg-white
            rounded-3xl
            p-6
            w-80
          "
          >

            <h3 className="text-xl font-bold text-center mb-5">
              Pilih Sumber Gambar
            </h3>

            <button
              onClick={() => {
                cameraRef.current.click();
                setShowModal(false);
              }}
              className="
                w-full
                bg-blue-600
                text-white
                p-4
                rounded-xl
                mb-3
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <Camera size={20} />
              Ambil Foto
            </button>

            <button
              onClick={() => {
                galleryRef.current.click();
                setShowModal(false);
              }}
              className="
                w-full
                bg-green-600
                text-white
                p-4
                rounded-xl
                mb-3
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <Images size={20} />
              Pilih Galeri
            </button>

            <button
              onClick={() =>
                setShowModal(false)
              }
              className="
                w-full
                border
                p-3
                rounded-xl
              "
            >
              Batal
            </button>

          </div>

        </div>

      )}

      {/* PREVIEW GAMBAR */}
      {selectedImage && (

        <div
          onClick={() =>
            setSelectedImage(null)
          }
          className="
            fixed
            inset-0
            bg-black/90
            flex
            items-center
            justify-center
            z-[10000]
          "
        >

          <button
            className="
            absolute
            top-5
            right-5
            text-white
          "
          >
            <X size={30} />
          </button>

          <img
            src={selectedImage}
            alt=""
            className="
              max-w-[90vw]
              max-h-[90vh]
              rounded-xl
            "
          />
        </div>
      )}
    </>
  );
}