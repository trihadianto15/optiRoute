import Tesseract from 'tesseract.js';

export async function extractTextFromImage(file) {
  const result = await Tesseract.recognize(
    file,
    'ind',
    {
      logger: (m) => console.log(m)
    }
  );

  return result.data.text;
}

/**
 * Normalisasi teks
 */
export function normalizeText(text) {
  return (text || '')
    .toLowerCase()

    // koreksi OCR umum RT/RW
    .replace(/rti/g, 'rt1')
    .replace(/rtl/g, 'rt1')
    .replace(/rtt/g, 'rt')
    .replace(/rto/g, 'rt0')

    .replace(/rwl/g, 'rw1')
    .replace(/rwi/g, 'rw1')
    .replace(/rww/g, 'rw')
    .replace(/rwo/g, 'rw0')

    .replace(/arw/g, 'rw')
    .replace(/arti/g, 'rt')

    // OCR angka sering terbaca huruf
    .replace(/o/g, '0')

    // samakan pemisah
    .replace(/[|\\]/g, '/')

    // buang karakter aneh
    .replace(/[^a-z0-9\s/]/g, ' ')

    // rapikan spasi
    .replace(/\s+/g, ' ')
    .trim();
}
/**
 * Ambil baris alamat
 */
export function splitAddresses(text) {
  const keywords = [
    'rt',
    'rw',
    'jalan',
    'jl',
    'kp',
    'desa',
    'kampung',
    'nagrak',
    'pawenang',
    'sukabumi'
  ];

  return (text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line =>
      line.length > 3 &&
      keywords.some(keyword =>
        line.toLowerCase().includes(keyword)
      )
    );
}

/**
 * Ambil alamat final
 */
export function extractAddressOnly(text) {
  const lines = splitAddresses(text);
  return lines.join(', ');
}

/**
 * Ekstrak RT/RW dari OCR (VERSI IMPROVED)
 */
export function extractRTRW(text) {

  if (!text) {
    return { rt: null, rw: null };
  }

  const normalized = text
    .toLowerCase()
    .replace(/[|\\]/g, "/")
    .replace(/[^a-z0-9/ ]/g, " ")   // 🔥 hapus noise OCR
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, "/")     // 🔥 rapikan slash
    .trim();

  console.log("NORMALIZED:", normalized);

  let match;

  /**
   * RT 22 RW 04 / RT22 RW04 / RT22RW04 / RT 22RW04
   */
  match = normalized.match(/rt\s*(\d{1,3})\s*rw\s*(\d{1,3})/i);
  if (match) {
    return {
      rt: Number(match[1]),
      rw: Number(match[2])
    };
  }

  /**
   * RT 22/RW 04 / RT22/RW04
   */
  match = normalized.match(/rt\s*(\d{1,3})\/rw\s*(\d{1,3})/i);
  if (match) {
    return {
      rt: Number(match[1]),
      rw: Number(match[2])
    };
  }

  /**
   * RT22/04 (tanpa RW tertulis)
   */
  match = normalized.match(/rt\s*(\d{1,3})\/(\d{1,3})/i);
  if (match) {
    return {
      rt: Number(match[1]),
      rw: Number(match[2])
    };
  }

  /**
   * RT22RW04 (tanpa spasi)
   */
  match = normalized.match(/rt(\d{1,3})rw(\d{1,3})/i);
  if (match) {
    return {
      rt: Number(match[1]),
      rw: Number(match[2])
    };
  }

  /**
   * (RT1804 / RT 1804 / 1804)
   * heuristic split aman
   */
  match = normalized.match(/rt\s*(\d{3,4})/i);

  if (match) {
    const digits = match[1];

    // 4 digit → RT 18 RW 04 (paling umum Indonesia)
    if (digits.length === 4) {
      return {
        rt: Number(digits.slice(0, 2)),
        rw: Number(digits.slice(2, 4))
      };
    }

    // 3 digit → heuristic split
    if (digits.length === 3) {
      return {
        rt: Number(digits.slice(0, 1)),
        rw: Number(digits.slice(1, 3))
      };
    }
  }

  /**
   * fallback terakhir (RT & RW terpisah)
   */
  const rtMatch = normalized.match(/rt\s*(\d{1,3})/i);
  const rwMatch = normalized.match(/rw\s*(\d{1,3})/i);

  if (rtMatch && rwMatch) {
    return {
      rt: Number(rtMatch[1]),
      rw: Number(rwMatch[1])
    };
  }

  console.log("RT/RW TIDAK DITEMUKAN");

  return { rt: null, rw: null };
}

export function extractVillage(
  text
) {

  const villages = [

    "pawenang",
    "kalaparea",
    "cisarua",
    "nagrak utara"

  ];

  const normalized =
    text.toLowerCase();

  for (const village of villages) {

    if (
      normalized.includes(
        village
      )
    ) {

      return village;

    }

  }

  return null;

}