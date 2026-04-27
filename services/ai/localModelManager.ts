import { Directory, File, Paths } from "expo-file-system";

import type { LocalModelInfo, LocalModelState } from "@/types/ai";

const MODEL_INFO: LocalModelInfo = {
  modelId: "bartowski/Qwen2.5-1.5B-Instruct-GGUF",
  fileName: "Qwen2.5-1.5B-Instruct-Q4_K_M.gguf",
  downloadUrl:
    "https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf?download=true",
  sizeMb: 1000,
  minAppVersion: "1.0.0",
};
const MIN_READY_FILE_BYTES = Math.floor(MODEL_INFO.sizeMb * 1024 * 1024 * 0.8);

const DEFAULT_STATE: LocalModelState = {
  status: "not_downloaded",
  model: MODEL_INFO,
  progress: 0,
};

type LocalModelListener = (state: LocalModelState) => void;

let localModelState: LocalModelState = DEFAULT_STATE;
const listeners = new Set<LocalModelListener>();
let isDownloadInProgress = false;
let expectedDownloadBytes: number | null = null;
let progressIntervalId: ReturnType<typeof setInterval> | null = null;
let lastReadyRefreshAt = 0;
const READY_STATE_REFRESH_CACHE_MS = 15000;

function emitState(nextState: LocalModelState) {
  localModelState = nextState;
  listeners.forEach((listener) => {
    listener(localModelState);
  });
}

function getModelDirectory(): Directory {
  return new Directory(Paths.document, "models");
}

function getModelFile(): File {
  return new File(getModelDirectory(), MODEL_INFO.fileName);
}

function clearProgressInterval() {
  if (!progressIntervalId) {
    return;
  }

  clearInterval(progressIntervalId);
  progressIntervalId = null;
}

async function ensureModelDirectory() {
  const modelDirectory = getModelDirectory();
  const directoryInfo = modelDirectory.info();

  if (!directoryInfo.exists) {
    modelDirectory.create({ idempotent: true, intermediates: true });
  }
}

function mapDownloadErrorToMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    if (error.message.includes("status: 401")) {
      return "Model download blocked (401). The file may require Hugging Face auth/token or gated access.";
    }
    return error.message;
  }

  return "Model download failed.";
}

function getDownloadHeaders(): Record<string, string> {
  const token = process.env.EXPO_PUBLIC_HF_TOKEN?.trim();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getLocalModelState(): LocalModelState {
  return localModelState;
}

export function subscribeToLocalModelState(listener: LocalModelListener): () => void {
  listeners.add(listener);
  listener(localModelState);

  return () => {
    listeners.delete(listener);
  };
}

export async function refreshLocalModelState(): Promise<LocalModelState> {
  if (
    localModelState.status === "ready" &&
    !isDownloadInProgress &&
    Date.now() - lastReadyRefreshAt < READY_STATE_REFRESH_CACHE_MS
  ) {
    return localModelState;
  }

  try {
    const modelFile = getModelFile();
    const fileInfo = modelFile.info();

    if (!fileInfo.exists) {
      emitState({
        ...localModelState,
        status: "not_downloaded",
        localUri: undefined,
        progress: 0,
        errorMessage: undefined,
      });

      return localModelState;
    }

    if ((fileInfo.size ?? 0) < MIN_READY_FILE_BYTES) {
      emitState({
        ...localModelState,
        status: "unavailable",
        localUri: undefined,
        progress: 0,
        errorMessage: "Model file looks incomplete. Please clear and download again.",
      });

      return localModelState;
    }

    if (MODEL_INFO.expectedMd5) {
      const fileInfoWithMd5 = modelFile.info({ md5: true });

      if (fileInfoWithMd5.md5 !== MODEL_INFO.expectedMd5) {
        emitState({
          ...localModelState,
          status: "unavailable",
          localUri: undefined,
          progress: 0,
          errorMessage: "Model checksum mismatch. Redownload required.",
        });

        return localModelState;
      }
    }

    emitState({
      ...localModelState,
      status: "ready",
      localUri: modelFile.uri,
      progress: 1,
      errorMessage: undefined,
    });
    lastReadyRefreshAt = Date.now();
  } catch (error) {
    emitState({
      ...localModelState,
      status: "unavailable",
      localUri: undefined,
      progress: 0,
      errorMessage: mapDownloadErrorToMessage(error),
    });
  }

  return localModelState;
}

async function resolveExpectedDownloadBytes(): Promise<number | null> {
  try {
    const response = await fetch(MODEL_INFO.downloadUrl, {
      method: "HEAD",
      headers: getDownloadHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    const contentLengthHeader = response.headers.get("content-length");

    if (!contentLengthHeader) {
      return null;
    }

    const parsed = Number(contentLengthHeader);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function startProgressPolling() {
  clearProgressInterval();

  progressIntervalId = setInterval(() => {
    if (!isDownloadInProgress) {
      clearProgressInterval();
      return;
    }

    try {
      const modelFile = getModelFile();
      const info = modelFile.info();
      const downloadedBytes = info.exists ? (info.size ?? 0) : 0;

      if (expectedDownloadBytes && expectedDownloadBytes > 0) {
        const computedProgress = Math.min(downloadedBytes / expectedDownloadBytes, 0.99);
        emitState({
          ...localModelState,
          status: "downloading",
          progress: computedProgress,
        });
      } else {
        emitState({
          ...localModelState,
          status: "downloading",
          progress: downloadedBytes > 0 ? 0.5 : 0.01,
        });
      }
    } catch {
      // Keep polling; transient read errors should not break download flow.
    }
  }, 1000);
}

export async function startLocalModelDownload(): Promise<void> {
  await ensureModelDirectory();

  if (localModelState.status === "downloading" || isDownloadInProgress) {
    return;
  }

  const modelFile = getModelFile();
  if (modelFile.exists) {
    modelFile.delete();
  }
  emitState({
    ...localModelState,
    status: "downloading",
    localUri: undefined,
    progress: 0.01,
    errorMessage: undefined,
  });
  isDownloadInProgress = true;
  lastReadyRefreshAt = 0;
  expectedDownloadBytes = await resolveExpectedDownloadBytes();
  startProgressPolling();

  try {
    await File.downloadFileAsync(MODEL_INFO.downloadUrl, modelFile, {
      idempotent: true,
      headers: getDownloadHeaders(),
    });
    await refreshLocalModelState();
  } catch (error) {
    emitState({
      ...localModelState,
      status: "unavailable",
      progress: 0,
      localUri: undefined,
      errorMessage: mapDownloadErrorToMessage(error),
    });
  } finally {
    isDownloadInProgress = false;
    expectedDownloadBytes = null;
    clearProgressInterval();
  }
}

export async function clearLocalModel(): Promise<void> {
  try {
    clearProgressInterval();
    isDownloadInProgress = false;
    expectedDownloadBytes = null;
    lastReadyRefreshAt = 0;

    const modelFile = getModelFile();
    if (modelFile.exists) {
      modelFile.delete();
    }

    emitState({
      ...localModelState,
      status: "not_downloaded",
      localUri: undefined,
      progress: 0,
      errorMessage: undefined,
    });
  } catch (error) {
    emitState({
      ...localModelState,
      status: "unavailable",
      localUri: undefined,
      progress: 0,
      errorMessage: mapDownloadErrorToMessage(error),
    });
  }
}
