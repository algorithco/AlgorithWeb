/**
 * AlgorithVoice on-device models, measured.
 *
 * Every figure is from one run of the app's own engine code on 12 October
 * 2026 (AlgorithVoice `tests/asr_eval.rs`): 100 test recordings per language
 * from FLEURS, one laptop, CPU only, four threads. Nothing here is taken
 * from a model card. When a model is measured again, change the numbers
 * here and the date in `benchmarkRun`.
 */

/** In the app today, or published and waiting for the next app release. */
export type BenchmarkStatus = "available" | "coming-soon";

export type BenchmarkModel = {
  /** Model id in the app's catalog. */
  id: string;
  name: string;
  status: BenchmarkStatus;
  /** The model we would choose for this language. One per language. */
  pick?: true;
  /** Word error rate, percent of the reference words. Lower is better. */
  wer: number;
  /** Seconds of speech transcribed per second of work. Higher is better. */
  speed: number;
  /** Memory the engine held at the end of the run. */
  memoryGb: number;
  downloadMb: number;
  /** Something the numbers do not say on their own. */
  note?: string;
};

export type BenchmarkLanguage = {
  code: "en" | "ru" | "uz";
  name: string;
  /** What the table says, in a sentence or two. */
  takeaway: string;
  /** Why the pick is the pick, for the summary card. */
  pickReason: string;
  minutes: number;
  /** Most accurate first. */
  models: readonly BenchmarkModel[];
  footnote?: string;
};

export const benchmarkRun = {
  date: "2026-10-12",
  recordingsPerLanguage: 100,
  dataset: "FLEURS test set",
  machine: "Intel Core i5-13420H laptop, 16 GB of memory, no GPU used",
  threads: 4,
} as const;

const FIRST_30 =
  "Measured on the first 30 recordings: it runs slower than speech.";

export const benchmarkLanguages = [
  {
    code: "en",
    name: "English",
    takeaway:
      "Whisper Large v3 Turbo makes the fewest errors. Parakeet Unified EN is within a point of it, five times faster, and takes half the memory.",
    pickReason:
      "A third fewer errors than today's default model at the same speed, and it only ever writes English.",
    minutes: 17,
    models: [
      {
        id: "whisper-large-v3-turbo",
        name: "Whisper Large v3 Turbo",
        status: "available",
        wer: 4.6,
        speed: 1.7,
        memoryGb: 2.0,
        downloadMb: 1040,
      },
      {
        id: "whisper-large-v3",
        name: "Whisper Large v3",
        status: "available",
        wer: 4.7,
        speed: 0.4,
        memoryGb: 4.4,
        downloadMb: 1780,
        note: FIRST_30,
      },
      {
        id: "distil-large-v3.5",
        name: "Distil Large v3.5",
        status: "available",
        wer: 5.2,
        speed: 1.8,
        memoryGb: 1.9,
        downloadMb: 983,
      },
      {
        id: "parakeet-unified-en-0.6b",
        name: "Parakeet Unified EN",
        status: "available",
        pick: true,
        wer: 5.3,
        speed: 9.5,
        memoryGb: 1.0,
        downloadMb: 663,
      },
      {
        id: "whisper-small",
        name: "Whisper Small",
        status: "available",
        wer: 6.1,
        speed: 1.8,
        memoryGb: 1.3,
        downloadMb: 375,
      },
      {
        id: "qwen3-asr-1.7b",
        name: "Qwen3 ASR 1.7B",
        status: "available",
        wer: 8.1,
        speed: 1.7,
        memoryGb: 3.7,
        downloadMb: 2400,
        note: "Returned nothing for one of the 100 recordings.",
      },
      {
        id: "parakeet-tdt-0.6b-v3",
        name: "Parakeet TDT 0.6B v3",
        status: "available",
        wer: 8.2,
        speed: 8.6,
        memoryGb: 1.0,
        downloadMb: 670,
        note: "The default model today. It guesses the language of each recording.",
      },
    ],
  },
  {
    code: "ru",
    name: "Russian",
    takeaway:
      "GigaAM v3 is the most accurate model here, the fastest and the smallest. Only Whisper Large v3 matches its accuracy, at a fortieth of the speed.",
    pickReason:
      "The most accurate, the fastest and the smallest of the five. It writes punctuation and capitals, in Russian only.",
    minutes: 18,
    models: [
      {
        id: "gigaam-v3-ru",
        name: "GigaAM v3",
        status: "available",
        pick: true,
        wer: 4.8,
        speed: 13.1,
        memoryGb: 0.3,
        downloadMb: 232,
      },
      {
        id: "whisper-large-v3",
        name: "Whisper Large v3",
        status: "available",
        wer: 4.8,
        speed: 0.3,
        memoryGb: 4.0,
        downloadMb: 1780,
        note: FIRST_30,
      },
      {
        id: "whisper-large-v3-turbo",
        name: "Whisper Large v3 Turbo",
        status: "available",
        wer: 5.3,
        speed: 1.6,
        memoryGb: 2.0,
        downloadMb: 1040,
      },
      {
        id: "parakeet-tdt-0.6b-v3",
        name: "Parakeet TDT 0.6B v3",
        status: "available",
        wer: 8.5,
        speed: 10.7,
        memoryGb: 1.0,
        downloadMb: 670,
        note: "The default model today.",
      },
      {
        id: "whisper-small",
        name: "Whisper Small",
        status: "available",
        wer: 11.9,
        speed: 1.3,
        memoryGb: 1.2,
        downloadMb: 375,
      },
    ],
  },
  {
    code: "uz",
    name: "Uzbek",
    takeaway:
      "The Whisper models in the app today do not write Uzbek: most words come out wrong, and Turbo wrote a third of the recordings in Cyrillic. FastConformer Uzbek is the first model here that does.",
    pickReason:
      "The only model here that writes real Uzbek, with capitals, punctuation and oʻ and gʻ, and by far the fastest.",
    minutes: 20,
    models: [
      {
        id: "fastconformer-uz",
        name: "FastConformer Uzbek",
        status: "available",
        pick: true,
        wer: 14.4,
        speed: 37,
        memoryGb: 0.5,
        downloadMb: 174,
      },
      {
        id: "whisper-large-v3",
        name: "Whisper Large v3",
        status: "available",
        wer: 85.1,
        speed: 0.2,
        memoryGb: 4.2,
        downloadMb: 1780,
        note: FIRST_30,
      },
      {
        id: "whisper-large-v3-turbo",
        name: "Whisper Large v3 Turbo",
        status: "available",
        wer: 95.1,
        speed: 1.4,
        memoryGb: 2.1,
        downloadMb: 1040,
        note: "35 recordings came out in Cyrillic and 12 empty.",
      },
      {
        id: "whisper-small",
        name: "Whisper Small",
        status: "available",
        wer: 100.8,
        speed: 1.2,
        memoryGb: 1.3,
        downloadMb: 375,
      },
    ],
    footnote:
      "A word error rate near 100% means almost no word matched. It can pass 100% when a model writes more words than were said. Parakeet, Distil and Qwen3 do not cover Uzbek.",
  },
] as const satisfies readonly BenchmarkLanguage[];

/** The model we would choose for a language. */
export function pickOf(language: BenchmarkLanguage): BenchmarkModel {
  const pick = language.models.find((model) => model.pick);
  if (!pick) throw new Error(`no pick for ${language.code}`);
  return pick;
}

/** "5.3%": one decimal, as measured. */
export function formatWer(wer: number): string {
  return `${wer.toFixed(1)}%`;
}

/** "9.5×", or "37×" once the decimal stops meaning anything. */
export function formatSpeed(speed: number): string {
  return `${speed >= 20 ? Math.round(speed) : speed.toFixed(1)}×`;
}

/** "663 MB", "1.8 GB". */
export function formatDownload(megabytes: number): string {
  return megabytes >= 1000
    ? `${(megabytes / 1000).toFixed(1)} GB`
    : `${megabytes} MB`;
}

export function formatMemory(gigabytes: number): string {
  return `${gigabytes.toFixed(1)} GB`;
}
