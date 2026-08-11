"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SpreekAgent.module.css";

const baseUrl = process.env.NEXT_PUBLIC_NIDUS_API_URL?.trim();
const apiBaseUrl = baseUrl?.replace(/\/+$/, "") ?? "";
const tokenEndpoint = `${apiBaseUrl}/api/portfolio/linguix/realtime-token`;
const observationsEndpoint = `${apiBaseUrl}/api/portfolio/linguix/observaties`;
const openAIRealtimeEndpoint = "https://api.openai.com/v1/realtime/calls";
const defaultSessionDurationSeconds = 4 * 60;
const notUnderstoodMarker = "[[NIET_VERSTAAN]]";
const firstMisunderstandingResponse =
  "Sorry, ik heb u niet goed verstaan. Kan u dat nog eens zeggen?";
const secondMisunderstandingResponse =
  "Ik krijg dit niet duidelijk. We gaan verder.";
// Een taalwissel telt volgens de agentinstructies als een onbruikbare uiting,
// dus die beurt krijgt dezelfde markering als een niet verstane beurt.
const dutchOnlyResponse = "Dit gesprek is in het Nederlands.";
const closingResponse = "Dank u. Het gesprek is afgelopen.";

type SessionStatus = "inactief" | "verbinden" | "actief" | "beeindigd";
type TranscriptSpeaker = "candidate" | "agent";
type EndReason = "completed" | "manual" | "timeout" | "remote";
type ObservationKey = "taakvervulling" | "vloeiendheid" | "interactie";
type SignalCode =
  | "ONVERSTAANBAAR"
  | "TAALWISSEL"
  | "TE_WEINIG_BEURTEN";

interface RealtimeTokenResponse {
  value: string;
  expiresAt: number;
  sessionExpiresAt: number;
  sessionDurationSeconds: number;
  model: string;
}

interface TranscriptEntry {
  id: number;
  itemId: string | null;
  order: number;
  speaker: TranscriptSpeaker;
  text: string;
  notUnderstood: boolean;
}

interface SpeakingObservation {
  sleutel: ObservationKey;
  label: string;
  tekst: string;
}

interface SpeakingSignal {
  code: SignalCode;
  toelichting: string;
}

interface SpeakingObservationsResponse {
  aantalKandidaatBeurten: number;
  aantalOnverstaanbaar: number;
  beoordeelbaar: boolean;
  observaties: SpeakingObservation[];
  signalen: SpeakingSignal[];
}

interface SpreekAgentProps {
  /**
   * Presentatiemodus: een derde minder padding en marge, geen eigen kop of
   * omkadering, en een transcript met vaste hoogte (het scrolt zichzelf al mee)
   * zodat de observaties eronder op hun plek blijven staan.
   */
  compact?: boolean;
}

interface RealtimeServerEvent {
  type: string;
  delta?: string;
  transcript?: string;
  itemId?: string;
  error?: {
    message?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRealtimeTokenResponse(value: unknown): value is RealtimeTokenResponse {
  if (!isRecord(value)) return false;

  return (
    typeof value.value === "string" &&
    value.value.length > 0 &&
    typeof value.expiresAt === "number" &&
    Number.isFinite(value.expiresAt) &&
    typeof value.sessionExpiresAt === "number" &&
    Number.isFinite(value.sessionExpiresAt) &&
    typeof value.sessionDurationSeconds === "number" &&
    Number.isFinite(value.sessionDurationSeconds) &&
    typeof value.model === "string"
  );
}

function isObservationKey(value: unknown): value is ObservationKey {
  return (
    value === "taakvervulling" ||
    value === "vloeiendheid" ||
    value === "interactie"
  );
}

function isSignalCode(value: unknown): value is SignalCode {
  return (
    value === "ONVERSTAANBAAR" ||
    value === "TAALWISSEL" ||
    value === "TE_WEINIG_BEURTEN"
  );
}

function isSpeakingObservation(value: unknown): value is SpeakingObservation {
  if (!isRecord(value)) return false;
  return (
    isObservationKey(value.sleutel) &&
    typeof value.label === "string" &&
    value.label.trim().length > 0 &&
    typeof value.tekst === "string" &&
    value.tekst.trim().length > 0
  );
}

function isSpeakingSignal(value: unknown): value is SpeakingSignal {
  if (!isRecord(value)) return false;
  return (
    isSignalCode(value.code) &&
    typeof value.toelichting === "string" &&
    value.toelichting.trim().length > 0
  );
}

function isSpeakingObservationsResponse(
  value: unknown,
): value is SpeakingObservationsResponse {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.observaties) || !Array.isArray(value.signalen)) {
    return false;
  }

  const observations = value.observaties;
  const observationKeys = new Set(
    observations
      .filter(isSpeakingObservation)
      .map((observation) => observation.sleutel),
  );

  return (
    typeof value.aantalKandidaatBeurten === "number" &&
    Number.isInteger(value.aantalKandidaatBeurten) &&
    value.aantalKandidaatBeurten >= 0 &&
    typeof value.aantalOnverstaanbaar === "number" &&
    Number.isInteger(value.aantalOnverstaanbaar) &&
    value.aantalOnverstaanbaar >= 0 &&
    typeof value.beoordeelbaar === "boolean" &&
    observations.length === 3 &&
    observations.every(isSpeakingObservation) &&
    observationKeys.size === 3 &&
    value.signalen.every(isSpeakingSignal)
  );
}

function parseServerEvent(rawData: string): RealtimeServerEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawData) as unknown;
  } catch {
    return null;
  }

  if (!isRecord(parsed) || typeof parsed.type !== "string") return null;

  const errorValue = parsed.error;
  const error =
    isRecord(errorValue) && typeof errorValue.message === "string"
      ? { message: errorValue.message }
      : undefined;

  return {
    type: parsed.type,
    delta: typeof parsed.delta === "string" ? parsed.delta : undefined,
    transcript:
      typeof parsed.transcript === "string" ? parsed.transcript : undefined,
    itemId: typeof parsed.item_id === "string" ? parsed.item_id : undefined,
    error,
  };
}

async function readApiError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (isRecord(payload)) {
      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
      }

      if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error;
      }
    }
  } catch {
    // Het antwoord bevatte geen JSON-foutobject.
  }

  return fallbackMessage;
}

function getErrorName(error: unknown): string {
  if (error instanceof DOMException) return error.name;
  if (!isRecord(error)) return "";
  return typeof error.name === "string" ? error.name : "";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "De verbinding met de spreekagent is mislukt.";
}

function isMicrophonePermissionDenied(error: unknown): boolean {
  const errorName = getErrorName(error);
  return errorName === "NotAllowedError" || errorName === "SecurityError";
}

function formatTimer(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function statusLabel(status: SessionStatus): string {
  switch (status) {
    case "inactief":
      return "Klaar om te starten";
    case "verbinden":
      return "Microfoon en verbinding voorbereiden";
    case "actief":
      return "Gesprek actief";
    case "beeindigd":
      return "Gesprek beëindigd";
  }
}

function endReasonMessage(reason: EndReason): string {
  switch (reason) {
    case "completed":
      return "De drie taakbeurten zijn afgerond.";
    case "manual":
      return "Je hebt het gesprek beëindigd.";
    case "timeout":
      return "De maximale sessieduur van vier minuten is bereikt.";
    case "remote":
      return "De Realtime-sessie is gesloten.";
  }
}

export default function SpreekAgent({ compact = false }: SpreekAgentProps) {
  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>("inactief");
  const [remainingSeconds, setRemainingSeconds] = useState(
    defaultSessionDurationSeconds,
  );
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>(
    [],
  );
  const [agentDraft, setAgentDraft] = useState("");
  const [observations, setObservations] =
    useState<SpeakingObservationsResponse | null>(null);
  const [observationsLoading, setObservationsLoading] = useState(false);
  const [observationsError, setObservationsError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const observationsAbortControllerRef = useRef<AbortController | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const generationRef = useRef(0);
  const entryIdRef = useRef(0);
  const eventOrderRef = useRef(0);
  const agentDraftRef = useRef("");
  const agentDraftOrderRef = useRef<number | null>(null);
  const transcriptEntriesRef = useRef<TranscriptEntry[]>([]);
  const candidateOrderByItemIdRef = useRef<Map<string, number>>(new Map());
  const candidateItemIdsRef = useRef<string[]>([]);
  const notUnderstoodItemIdsRef = useRef<Set<string>>(new Set());
  const closingDetectedRef = useRef(false);
  const finishSessionRef = useRef<(reason: EndReason) => void>(() => undefined);
  const failSessionRef = useRef<(message: string) => void>(() => undefined);

  const replaceTranscriptEntries = useCallback(
    (entries: TranscriptEntry[]): void => {
      const sortedEntries = [...entries].sort(
        (first, second) => first.order - second.order || first.id - second.id,
      );
      transcriptEntriesRef.current = sortedEntries;
      setTranscriptEntries(sortedEntries);
    },
    [],
  );

  const addTranscriptEntry = useCallback(
    (
      speaker: TranscriptSpeaker,
      text: string,
      order: number,
      itemId: string | null,
      notUnderstood: boolean,
    ): void => {
      const cleanText = text.trim();
      if (!cleanText) return;

      if (itemId) {
        const existingEntry = transcriptEntriesRef.current.find(
          (entry) => entry.itemId === itemId && entry.speaker === speaker,
        );
        if (existingEntry) {
          replaceTranscriptEntries(
            transcriptEntriesRef.current.map((entry) =>
              entry.id === existingEntry.id
                ? {
                    ...entry,
                    text: cleanText,
                    notUnderstood: entry.notUnderstood || notUnderstood,
                  }
                : entry,
            ),
          );
          return;
        }
      }

      entryIdRef.current += 1;
      replaceTranscriptEntries([
        ...transcriptEntriesRef.current,
        {
          id: entryIdRef.current,
          itemId,
          order,
          speaker,
          text: cleanText,
          notUnderstood,
        },
      ]);
    },
    [replaceTranscriptEntries],
  );

  const reserveCandidateOrder = useCallback((itemId: string): number => {
    const existingOrder = candidateOrderByItemIdRef.current.get(itemId);
    if (existingOrder !== undefined) return existingOrder;

    eventOrderRef.current += 1;
    const order = eventOrderRef.current;
    candidateOrderByItemIdRef.current.set(itemId, order);
    candidateItemIdsRef.current.push(itemId);
    return order;
  }, []);

  const markLatestCandidateNotUnderstood = useCallback((): void => {
    const latestItemId = candidateItemIdsRef.current.at(-1);
    if (latestItemId) {
      notUnderstoodItemIdsRef.current.add(latestItemId);
      replaceTranscriptEntries(
        transcriptEntriesRef.current.map((entry) =>
          entry.itemId === latestItemId && entry.speaker === "candidate"
            ? { ...entry, notUnderstood: true }
            : entry,
        ),
      );
      return;
    }

    const latestCandidate = [...transcriptEntriesRef.current]
      .reverse()
      .find((entry) => entry.speaker === "candidate");
    if (!latestCandidate) return;

    replaceTranscriptEntries(
      transcriptEntriesRef.current.map((entry) =>
        entry.id === latestCandidate.id
          ? { ...entry, notUnderstood: true }
          : entry,
      ),
    );
  }, [replaceTranscriptEntries]);

  const cleanupConnection = useCallback((): void => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    if (completionTimeoutRef.current !== null) {
      window.clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    const dataChannel = dataChannelRef.current;
    dataChannelRef.current = null;
    if (dataChannel) {
      dataChannel.onopen = null;
      dataChannel.onmessage = null;
      dataChannel.onerror = null;
      dataChannel.onclose = null;
      if (dataChannel.readyState !== "closed") dataChannel.close();
    }

    const peerConnection = peerConnectionRef.current;
    peerConnectionRef.current = null;
    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.close();
    }

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }

    deadlineRef.current = null;
  }, []);

  const requestObservations = useCallback(
    async (
      entries: readonly TranscriptEntry[],
      generation: number,
    ): Promise<void> => {
      const hasCandidateTurn = entries.some(
        (entry) => entry.speaker === "candidate",
      );

      // Zonder kandidaatbeurt valt er niets te observeren: de aanvraag wordt
      // overgeslagen in plaats van het model een leeg transcript te sturen.
      if (!hasCandidateTurn) {
        setObservationsLoading(false);
        setObservationsError(
          "Er zijn geen kandidaatbeurten vastgelegd. Er worden geen observaties opgebouwd.",
        );
        return;
      }

      if (!apiBaseUrl) {
        setObservationsLoading(false);
        setObservationsError(
          "De API-URL voor de observaties ontbreekt in de configuratie.",
        );
        return;
      }

      observationsAbortControllerRef.current?.abort();
      const controller = new AbortController();
      observationsAbortControllerRef.current = controller;
      setObservationsLoading(true);
      setObservationsError(null);

      const turns = entries.map((entry) => ({
        spreker: entry.speaker === "agent" ? "agent" : "kandidaat",
        tekst:
          entry.speaker === "candidate" && entry.notUnderstood
            ? `${notUnderstoodMarker} ${entry.text}`
            : entry.text,
      }));

      try {
        const response = await fetch(observationsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beurten: turns }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            await readApiError(
              response,
              "De observaties konden niet worden opgebouwd.",
            ),
          );
        }

        const payload: unknown = await response.json();
        if (!isSpeakingObservationsResponse(payload)) {
          throw new Error("De observatieservice gaf een onverwacht antwoord.");
        }

        if (generationRef.current !== generation) return;
        setObservations(payload);
      } catch (error: unknown) {
        if (
          generationRef.current !== generation ||
          getErrorName(error) === "AbortError"
        ) {
          return;
        }
        setObservationsError(
          error instanceof Error && error.message.trim()
            ? error.message
            : "De observaties konden niet worden opgebouwd.",
        );
      } finally {
        if (generationRef.current === generation) {
          observationsAbortControllerRef.current = null;
          setObservationsLoading(false);
        }
      }
    },
    [],
  );

  const finalizeAgentDraft = useCallback((): void => {
    const draft = agentDraftRef.current.trim();
    if (draft) {
      eventOrderRef.current += agentDraftOrderRef.current === null ? 1 : 0;
      const order = agentDraftOrderRef.current ?? eventOrderRef.current;
      addTranscriptEntry("agent", draft, order, null, false);
    }

    agentDraftRef.current = "";
    agentDraftOrderRef.current = null;
    setAgentDraft("");
  }, [addTranscriptEntry]);

  const finishSession = useCallback(
    (reason: EndReason): void => {
      generationRef.current += 1;
      const generation = generationRef.current;
      finalizeAgentDraft();
      const entries = transcriptEntriesRef.current;
      cleanupConnection();
      closingDetectedRef.current = false;

      setSessionStatus("beeindigd");
      setRemainingSeconds(0);
      setErrorMessage(null);
      setEndMessage(endReasonMessage(reason));
      setObservations(null);
      void requestObservations(entries, generation);
    },
    [cleanupConnection, finalizeAgentDraft, requestObservations],
  );

  const failSession = useCallback(
    (message: string): void => {
      generationRef.current += 1;
      const generation = generationRef.current;
      finalizeAgentDraft();
      const entries = transcriptEntriesRef.current;
      cleanupConnection();
      closingDetectedRef.current = false;

      setSessionStatus("beeindigd");
      setRemainingSeconds(0);
      setErrorMessage(message);
      setEndMessage(null);
      setObservations(null);
      void requestObservations(entries, generation);
    },
    [cleanupConnection, finalizeAgentDraft, requestObservations],
  );

  useEffect(() => {
    finishSessionRef.current = finishSession;
    failSessionRef.current = failSession;
  }, [failSession, finishSession]);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      observationsAbortControllerRef.current?.abort();
      cleanupConnection();
    };
  }, [cleanupConnection]);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (!transcript) return;
    transcript.scrollTo({ top: transcript.scrollHeight, behavior: "smooth" });
  }, [agentDraft, transcriptEntries]);

  useEffect(() => {
    if (sessionStatus !== "actief") return;

    const updateTimer = (): void => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;

      const nextRemainingSeconds = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
      );
      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds === 0) {
        finishSessionRef.current("timeout");
      }
    };

    updateTimer();
    const timerId = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(timerId);
  }, [sessionStatus]);

  const handleServerMessage = useCallback(
    (generation: number, rawData: string): void => {
      if (generationRef.current !== generation) return;

      const event = parseServerEvent(rawData);
      if (!event) return;

      switch (event.type) {
        case "input_audio_buffer.committed":
        case "input_audio_buffer.speech_stopped":
          if (event.itemId) reserveCandidateOrder(event.itemId);
          break;

        case "conversation.item.input_audio_transcription.completed":
        case "input_audio_transcription.completed": {
          const itemId = event.itemId ?? null;
          eventOrderRef.current += itemId ? 0 : 1;
          const order = itemId
            ? reserveCandidateOrder(itemId)
            : eventOrderRef.current;
          addTranscriptEntry(
            "candidate",
            event.transcript ?? "",
            order,
            itemId,
            itemId ? notUnderstoodItemIdsRef.current.has(itemId) : false,
          );
          break;
        }

        case "conversation.item.input_audio_transcription.failed": {
          const itemId = event.itemId ?? null;
          eventOrderRef.current += itemId ? 0 : 1;
          const order = itemId
            ? reserveCandidateOrder(itemId)
            : eventOrderRef.current;
          if (itemId) notUnderstoodItemIdsRef.current.add(itemId);
          addTranscriptEntry(
            "candidate",
            "Transcriptie niet beschikbaar.",
            order,
            itemId,
            true,
          );
          break;
        }

        case "response.output_audio_transcript.delta": {
          const delta = event.delta ?? "";
          if (!delta) break;
          if (agentDraftOrderRef.current === null) {
            eventOrderRef.current += 1;
            agentDraftOrderRef.current = eventOrderRef.current;
          }
          agentDraftRef.current += delta;
          setAgentDraft(agentDraftRef.current);
          break;
        }

        case "response.output_audio_transcript.done": {
          const completedTranscript = (
            event.transcript ?? agentDraftRef.current
          ).trim();
          if (agentDraftOrderRef.current === null) {
            eventOrderRef.current += 1;
            agentDraftOrderRef.current = eventOrderRef.current;
          }
          const order = agentDraftOrderRef.current;
          agentDraftRef.current = "";
          agentDraftOrderRef.current = null;
          setAgentDraft("");
          addTranscriptEntry(
            "agent",
            completedTranscript,
            order,
            event.itemId ?? null,
            false,
          );

          if (
            completedTranscript.includes(firstMisunderstandingResponse) ||
            completedTranscript.includes(secondMisunderstandingResponse) ||
            completedTranscript.includes(dutchOnlyResponse)
          ) {
            markLatestCandidateNotUnderstood();
          }

          if (completedTranscript.includes(closingResponse)) {
            closingDetectedRef.current = true;
          }
          break;
        }

        case "response.done":
          if (
            closingDetectedRef.current &&
            completionTimeoutRef.current === null
          ) {
            completionTimeoutRef.current = window.setTimeout(() => {
              completionTimeoutRef.current = null;
              finishSessionRef.current("completed");
            }, 1200);
          }
          break;

        case "error":
          failSessionRef.current(
            event.error?.message ??
              "De Realtime-sessie meldde een onverwachte fout.",
          );
          break;

        default:
          break;
      }
    },
    [
      addTranscriptEntry,
      markLatestCandidateNotUnderstood,
      reserveCandidateOrder,
    ],
  );

  const startConversation = useCallback(async (): Promise<void> => {
    if (sessionStatus !== "inactief") return;

    generationRef.current += 1;
    const generation = generationRef.current;
    cleanupConnection();
    setSessionStatus("verbinden");
    setErrorMessage(null);
    setEndMessage(null);
    setObservations(null);
    setObservationsError(null);
    setObservationsLoading(false);
    setRemainingSeconds(defaultSessionDurationSeconds);

    if (!apiBaseUrl) {
      failSessionRef.current(
        "De API-URL voor de spreekagent ontbreekt in de configuratie.",
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      failSessionRef.current(
        "Deze browser ondersteunt geen microfoontoegang voor het gesprek.",
      );
      return;
    }

    let mediaStream: MediaStream;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
    } catch (error: unknown) {
      if (generationRef.current !== generation) return;

      failSessionRef.current(
        isMicrophonePermissionDenied(error)
          ? "Microfoontoegang is geweigerd. Geef deze site toestemming om je microfoon te gebruiken en kies daarna ‘Nieuw gesprek’."
          : getErrorName(error) === "NotFoundError"
            ? "Er is geen beschikbare microfoon gevonden. Sluit een microfoon aan en kies daarna ‘Nieuw gesprek’."
            : "De microfoon kon niet worden geopend. Controleer je browser- en apparaatinstellingen en kies daarna ‘Nieuw gesprek’.",
      );
      return;
    }

    if (generationRef.current !== generation) {
      mediaStream.getTracks().forEach((track) => track.stop());
      return;
    }

    mediaStreamRef.current = mediaStream;

    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    peerConnection.ontrack = (event: RTCTrackEvent): void => {
      if (generationRef.current !== generation || !audioRef.current) return;

      const remoteStream = event.streams[0] ?? new MediaStream([event.track]);
      audioRef.current.srcObject = remoteStream;
      void audioRef.current.play().catch(() => {
        // Sommige browsers vragen ondanks de startklik nog extra interactie.
      });
    };

    peerConnection.onconnectionstatechange = (): void => {
      if (generationRef.current !== generation) return;
      if (peerConnection.connectionState === "failed") {
        failSessionRef.current(
          "De audioverbinding kon niet worden opgebouwd. Kies ‘Nieuw gesprek’ en probeer opnieuw.",
        );
      }
    };

    mediaStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, mediaStream);
    });

    const dataChannel = peerConnection.createDataChannel("oai-events");
    dataChannelRef.current = dataChannel;

    dataChannel.onmessage = (event: MessageEvent<string>): void => {
      handleServerMessage(generation, event.data);
    };

    dataChannel.onopen = (): void => {
      if (generationRef.current !== generation) return;
      setSessionStatus("actief");

      // Geen client-instructies: dit activeert uitsluitend de server-side prompt.
      dataChannel.send(JSON.stringify({ type: "response.create" }));
    };

    dataChannel.onerror = (): void => {
      if (generationRef.current !== generation) return;
      failSessionRef.current(
        "Het datakanaal van de spreekagent is uitgevallen.",
      );
    };

    dataChannel.onclose = (): void => {
      if (generationRef.current !== generation) return;
      finishSessionRef.current("remote");
    };

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      if (generationRef.current !== generation) return;

      const offerSdp = peerConnection.localDescription?.sdp ?? offer.sdp;
      if (!offerSdp) throw new Error("De browser maakte geen geldige SDP-offer.");

      const tokenResponse = await fetch(tokenEndpoint, {
        method: "POST",
        signal: abortController.signal,
      });
      if (!tokenResponse.ok) {
        throw new Error(
          await readApiError(
            tokenResponse,
            "De spreekagent kon niet worden gestart. Probeer het later opnieuw.",
          ),
        );
      }

      const tokenPayload: unknown = await tokenResponse.json();
      if (!isRealtimeTokenResponse(tokenPayload)) {
        throw new Error("De tokenservice gaf een onverwacht antwoord.");
      }

      if (generationRef.current !== generation) return;
      deadlineRef.current = tokenPayload.sessionExpiresAt * 1000;
      setRemainingSeconds(
        Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)),
      );

      const sdpResponse = await fetch(openAIRealtimeEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenPayload.value}`,
          "Content-Type": "application/sdp",
        },
        body: offerSdp,
        signal: abortController.signal,
      });
      if (!sdpResponse.ok) {
        throw new Error("OpenAI weigerde de tijdelijke Realtime-verbinding.");
      }

      const answerSdp = await sdpResponse.text();
      if (generationRef.current !== generation) return;

      await peerConnection.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });
    } catch (error: unknown) {
      if (
        generationRef.current !== generation ||
        getErrorName(error) === "AbortError"
      ) {
        return;
      }

      failSessionRef.current(getErrorMessage(error));
    }
  }, [cleanupConnection, handleServerMessage, sessionStatus]);

  const resetConversation = useCallback((): void => {
    generationRef.current += 1;
    observationsAbortControllerRef.current?.abort();
    observationsAbortControllerRef.current = null;
    cleanupConnection();

    entryIdRef.current = 0;
    eventOrderRef.current = 0;
    agentDraftRef.current = "";
    agentDraftOrderRef.current = null;
    transcriptEntriesRef.current = [];
    candidateOrderByItemIdRef.current.clear();
    candidateItemIdsRef.current = [];
    notUnderstoodItemIdsRef.current.clear();
    closingDetectedRef.current = false;

    setSessionStatus("inactief");
    setRemainingSeconds(defaultSessionDurationSeconds);
    setTranscriptEntries([]);
    setAgentDraft("");
    setObservations(null);
    setObservationsLoading(false);
    setObservationsError(null);
    setErrorMessage(null);
    setEndMessage(null);
  }, [cleanupConnection]);

  const canEnd = sessionStatus === "verbinden" || sessionStatus === "actief";

  return (
    <section
      className={`${styles.agent} ${compact ? styles.agentCompact : ""}`}
      aria-labelledby={compact ? undefined : "spreekagent-title"}
      aria-label={compact ? "Spreekagent" : undefined}
    >
      {compact ? null : (
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Live demo · WebRTC</span>
            <h3 id="spreekagent-title" className={styles.title}>
              Spreekagent
            </h3>
          </div>
          <p className={styles.headerNote}>
            Kort taakgesprek met een maximale duur van vier minuten.
          </p>
        </header>
      )}

      <div className={styles.sessionBar}>
        <div className={styles.status} role="status" aria-live="polite">
          <span
            className={`${styles.statusDot} ${
              sessionStatus === "actief" ? styles.statusDotActive : ""
            }`}
            aria-hidden="true"
          />
          <span>{statusLabel(sessionStatus)}</span>
        </div>
        <div
          className={`${styles.timer} ${
            remainingSeconds <= 30 && sessionStatus === "actief"
              ? styles.timerUrgent
              : ""
          }`}
          aria-label={`Resterende gesprekstijd: ${formatTimer(remainingSeconds)}`}
        >
          <span className={styles.timerLabel}>Resterend</span>
          <span className={styles.timerValue}>
            {formatTimer(remainingSeconds)}
          </span>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.startButton}
          onClick={() => void startConversation()}
          disabled={sessionStatus !== "inactief"}
        >
          Start gesprek
        </button>
        <button
          type="button"
          className={styles.endButton}
          onClick={() => finishSession("manual")}
          disabled={!canEnd}
        >
          Beëindig
        </button>
        {sessionStatus === "beeindigd" ? (
          <button
            type="button"
            className={styles.resetButton}
            onClick={resetConversation}
          >
            Nieuw gesprek
          </button>
        ) : null}
      </div>

      {errorMessage ? (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {endMessage ? (
        <p className={styles.endMessage} role="status">
          {endMessage}
        </p>
      ) : null}

      <div className={styles.transcriptPanel}>
        <div className={styles.panelHeading}>
          <span className={styles.panelLabel}>Live transcript</span>
          <span className={styles.transcriptNote}>
            Audio en transcript worden niet opgeslagen
          </span>
        </div>

        <div
          ref={transcriptRef}
          className={styles.transcript}
          aria-live="polite"
          aria-relevant="additions text"
        >
          {transcriptEntries.length === 0 && !agentDraft ? (
            <p className={styles.emptyTranscript}>
              Het transcript verschijnt hier zodra het gesprek start.
            </p>
          ) : null}

          {transcriptEntries.map((entry) => (
            <article
              key={entry.id}
              className={`${styles.transcriptEntry} ${
                entry.speaker === "agent"
                  ? styles.agentEntry
                  : styles.candidateEntry
              }`}
            >
              <div className={styles.speakerLine}>
                <span className={styles.speakerLabel}>
                  {entry.speaker === "agent" ? "AI-agent" : "Kandidaat"}
                </span>
                {entry.notUnderstood ? (
                  <span className={styles.notUnderstoodBadge}>
                    Niet verstaan
                  </span>
                ) : null}
              </div>
              <p>{entry.text}</p>
            </article>
          ))}

          {agentDraft ? (
            <article className={`${styles.transcriptEntry} ${styles.agentEntry}`}>
              <span className={styles.speakerLabel}>AI-agent · spreekt</span>
              <p>{agentDraft}</p>
            </article>
          ) : null}
        </div>
      </div>

      <aside className={styles.observations} aria-labelledby="observations-title">
        <div className={styles.panelHeading}>
          <h4 id="observations-title" className={styles.observationsTitle}>
            Observaties na afloop
          </h4>
          <span className={styles.noScoreBadge}>Geen score</span>
        </div>

        {observationsLoading ? (
          <p className={styles.observationsPlaceholder} role="status">
            Beschrijvende observaties worden opgebouwd…
          </p>
        ) : null}

        {observationsError ? (
          <p className={styles.observationsError} role="alert">
            {observationsError}
          </p>
        ) : null}

        {observations && !observations.beoordeelbaar ? (
          <section className={styles.notAssessable} aria-label="Niet beoordeelbaar">
            <h5>Deze afname is niet beoordeelbaar.</h5>
            <ul>
              {observations.signalen.map((signal) => (
                <li key={signal.code}>
                  <span>{signal.code.replaceAll("_", " ")}</span>
                  <p>{signal.toelichting}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {observations ? (
          <dl className={styles.observationGrid}>
            {observations.observaties.map((observation) => (
              <div key={observation.sleutel}>
                <dt>{observation.label}</dt>
                <dd>{observation.tekst}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {!observations && !observationsLoading && !observationsError ? (
          <p className={styles.observationsPlaceholder}>
            Na het gesprek verschijnen hier korte, beschrijvende observaties.
          </p>
        ) : null}

        <p className={styles.phaseStatement}>
          Fase 3: de agent neemt af en observeert. Het oordeel blijft bij de
          menselijke examinator.
        </p>
      </aside>

      <audio
        ref={audioRef}
        autoPlay
        className={styles.remoteAudio}
        aria-hidden="true"
      />
    </section>
  );
}
