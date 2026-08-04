"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SpreekAgent.module.css";

const baseUrl = process.env.NEXT_PUBLIC_NIDUS_API_URL?.trim();
const apiBaseUrl = baseUrl?.replace(/\/+$/, "") ?? "";
const tokenEndpoint = `${apiBaseUrl}/api/portfolio/linguix/realtime-token`;
const openAIRealtimeEndpoint = "https://api.openai.com/v1/realtime/calls";
const defaultSessionDurationSeconds = 4 * 60;

type ConnectionStatus =
  | "idle"
  | "requesting-permission"
  | "connecting"
  | "connected"
  | "ended"
  | "error";

type TranscriptSpeaker = "candidate" | "agent";
type EndReason = "completed" | "manual" | "timeout" | "remote";

interface RealtimeTokenResponse {
  value: string;
  expiresAt: number;
  sessionExpiresAt: number;
  sessionDurationSeconds: number;
  model: string;
}

interface TranscriptEntry {
  id: number;
  speaker: TranscriptSpeaker;
  text: string;
}

interface SpeakingObservations {
  taskCompletion: string;
  fluency: string;
  interaction: string;
}

interface RealtimeServerEvent {
  type: string;
  delta?: string;
  transcript?: string;
  error?: {
    message?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

function parseServerEvent(rawData: string): RealtimeServerEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawData) as unknown;
  } catch {
    return null;
  }

  if (!isRecord(parsed) || typeof parsed.type !== "string") return null;

  const errorValue = parsed.error;
  const error = isRecord(errorValue) && typeof errorValue.message === "string"
    ? { message: errorValue.message }
    : undefined;

  return {
    type: parsed.type,
    delta: typeof parsed.delta === "string" ? parsed.delta : undefined,
    transcript:
      typeof parsed.transcript === "string" ? parsed.transcript : undefined,
    error,
  };
}

async function readApiError(response: Response): Promise<string> {
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

  return "De spreekagent kon niet worden gestart. Probeer het later opnieuw.";
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

function extractObservation(
  transcript: string,
  label: string,
  nextLabel?: string,
): string | null {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const boundary = nextLabel
    ? `(?=\\s*${nextLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:)`
    : "$";
  const match = transcript.match(
    new RegExp(`${escapedLabel}\\s*:\\s*([\\s\\S]*?)${boundary}`, "i"),
  );
  const observation = match?.[1]?.trim();
  return observation ? observation : null;
}

function parseObservations(transcript: string): SpeakingObservations | null {
  const taskCompletion = extractObservation(
    transcript,
    "Taakvervulling",
    "Vloeiendheid",
  );
  const fluency = extractObservation(transcript, "Vloeiendheid", "Interactie");
  const interaction = extractObservation(transcript, "Interactie");

  if (!taskCompletion || !fluency || !interaction) return null;
  return { taskCompletion, fluency, interaction };
}

function buildFallbackObservations(
  transcriptEntries: readonly TranscriptEntry[],
): SpeakingObservations {
  const candidateTurns = transcriptEntries.filter(
    (entry) => entry.speaker === "candidate",
  ).length;

  return {
    taskCompletion:
      candidateTurns === 0
        ? "Er was in dit korte gesprek onvoldoende bewijs om de taakvervulling te beschrijven."
        : "Het gesprek eindigde voordat alle drie de taakstappen waren afgerond.",
    fluency:
      "Er was in dit korte gesprek onvoldoende bewijs om de vloeiendheid zorgvuldig te beschrijven.",
    interaction:
      candidateTurns === 0
        ? "Er vond geen volledige inhoudelijke gespreksbeurt plaats."
        : `Er ${candidateTurns === 1 ? "vond" : "vonden"} ${candidateTurns} inhoudelijke ${candidateTurns === 1 ? "gespreksbeurt" : "gespreksbeurten"} plaats.`,
  };
}

function statusLabel(status: ConnectionStatus): string {
  switch (status) {
    case "idle":
      return "Klaar om te starten";
    case "requesting-permission":
      return "Wacht op microfoontoestemming";
    case "connecting":
      return "Veilige verbinding opbouwen";
    case "connected":
      return "Gesprek actief";
    case "ended":
      return "Gesprek beëindigd";
    case "error":
      return "Verbinding mislukt";
  }
}

export default function SpreekAgent() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(
    defaultSessionDurationSeconds,
  );
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [agentDraft, setAgentDraft] = useState("");
  const [observations, setObservations] = useState<SpeakingObservations | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [endMessage, setEndMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const generationRef = useRef(0);
  const entryIdRef = useRef(0);
  const agentDraftRef = useRef("");
  const transcriptEntriesRef = useRef<TranscriptEntry[]>([]);
  const observationsRef = useRef<SpeakingObservations | null>(null);
  const finishSessionRef = useRef<(reason: EndReason) => void>(() => undefined);
  const failSessionRef = useRef<(message: string) => void>(() => undefined);

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

  const finishSession = useCallback(
    (reason: EndReason): void => {
      generationRef.current += 1;
      cleanupConnection();
      agentDraftRef.current = "";
      setAgentDraft("");

      if (!observationsRef.current) {
        const fallbackObservations = buildFallbackObservations(
          transcriptEntriesRef.current,
        );
        observationsRef.current = fallbackObservations;
        setObservations(fallbackObservations);
      }

      setStatus("ended");
      setErrorMessage(null);
      setEndMessage(
        reason === "timeout"
          ? "De maximale sessieduur van vier minuten is bereikt."
          : reason === "completed"
            ? "De drie taakbeurten zijn afgerond."
            : reason === "remote"
              ? "De Realtime-sessie is gesloten."
              : "Je hebt het gesprek beëindigd.",
      );
    },
    [cleanupConnection],
  );

  const failSession = useCallback(
    (message: string): void => {
      generationRef.current += 1;
      cleanupConnection();
      agentDraftRef.current = "";
      setAgentDraft("");
      setStatus("error");
      setErrorMessage(message);
      setEndMessage(null);
    },
    [cleanupConnection],
  );

  useEffect(() => {
    finishSessionRef.current = finishSession;
    failSessionRef.current = failSession;
  }, [failSession, finishSession]);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      cleanupConnection();
    };
  }, [cleanupConnection]);

  useEffect(() => {
    if (status !== "connected") return;

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
  }, [status]);

  const addTranscriptEntry = useCallback(
    (speaker: TranscriptSpeaker, text: string): void => {
      const cleanText = text.trim();
      if (!cleanText) return;

      entryIdRef.current += 1;
      const nextEntry: TranscriptEntry = {
        id: entryIdRef.current,
        speaker,
        text: cleanText,
      };

      transcriptEntriesRef.current = [
        ...transcriptEntriesRef.current,
        nextEntry,
      ];
      setTranscriptEntries(transcriptEntriesRef.current);
    },
    [],
  );

  const handleServerMessage = useCallback(
    (generation: number, rawData: string): void => {
      if (generationRef.current !== generation) return;

      const event = parseServerEvent(rawData);
      if (!event) return;

      switch (event.type) {
        case "conversation.item.input_audio_transcription.completed":
        case "input_audio_transcription.completed":
          addTranscriptEntry("candidate", event.transcript ?? "");
          break;

        case "response.output_audio_transcript.delta": {
          const delta = event.delta ?? "";
          if (!delta) break;
          agentDraftRef.current += delta;
          setAgentDraft(agentDraftRef.current);
          break;
        }

        case "response.output_audio_transcript.done": {
          const completedTranscript = (
            event.transcript ?? agentDraftRef.current
          ).trim();
          agentDraftRef.current = "";
          setAgentDraft("");
          addTranscriptEntry("agent", completedTranscript);

          const parsedObservations = parseObservations(completedTranscript);
          if (parsedObservations) {
            observationsRef.current = parsedObservations;
            setObservations(parsedObservations);
          }
          break;
        }

        case "response.done":
          if (
            observationsRef.current &&
            completionTimeoutRef.current === null
          ) {
            completionTimeoutRef.current = window.setTimeout(() => {
              completionTimeoutRef.current = null;
              finishSessionRef.current("completed");
            }, 1800);
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
    [addTranscriptEntry],
  );

  const startConversation = useCallback(async (): Promise<void> => {
    generationRef.current += 1;
    const generation = generationRef.current;
    cleanupConnection();

    transcriptEntriesRef.current = [];
    observationsRef.current = null;
    agentDraftRef.current = "";
    entryIdRef.current = 0;
    setTranscriptEntries([]);
    setObservations(null);
    setAgentDraft("");
    setErrorMessage(null);
    setEndMessage(null);
    setRemainingSeconds(defaultSessionDurationSeconds);

    if (!apiBaseUrl) {
      setStatus("error");
      setErrorMessage(
        "De API-URL voor de spreekagent ontbreekt in de configuratie.",
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMessage(
        "Deze browser ondersteunt geen microfoontoegang voor het gesprek.",
      );
      return;
    }

    setStatus("requesting-permission");

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

      setStatus("error");
      setErrorMessage(
        isMicrophonePermissionDenied(error)
          ? "Microfoontoegang is geweigerd. Geef deze site toestemming om je microfoon te gebruiken en start daarna opnieuw."
          : getErrorName(error) === "NotFoundError"
            ? "Er is geen beschikbare microfoon gevonden. Sluit een microfoon aan en probeer opnieuw."
            : "De microfoon kon niet worden geopend. Controleer je browser- en apparaatinstellingen.",
      );
      return;
    }

    if (generationRef.current !== generation) {
      mediaStream.getTracks().forEach((track) => track.stop());
      return;
    }

    mediaStreamRef.current = mediaStream;
    setStatus("connecting");

    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    peerConnection.ontrack = (event: RTCTrackEvent): void => {
      if (generationRef.current !== generation || !audioRef.current) return;

      const remoteStream = event.streams[0] ?? new MediaStream([event.track]);
      audioRef.current.srcObject = remoteStream;
      void audioRef.current.play().catch(() => {
        // De gebruiker start vanuit een klik; sommige browsers vragen toch extra interactie.
      });
    };

    peerConnection.onconnectionstatechange = (): void => {
      if (generationRef.current !== generation) return;
      if (peerConnection.connectionState === "failed") {
        failSessionRef.current(
          "De audioverbinding kon niet worden opgebouwd. Probeer opnieuw.",
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
      setStatus("connected");

      // Geen client-instructies: dit activeert uitsluitend de server-side prompt.
      dataChannel.send(JSON.stringify({ type: "response.create" }));
    };

    dataChannel.onerror = (): void => {
      if (generationRef.current !== generation) return;
      failSessionRef.current("Het datakanaal van de spreekagent is uitgevallen.");
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
        throw new Error(await readApiError(tokenResponse));
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
  }, [cleanupConnection, handleServerMessage]);

  const isActive =
    status === "requesting-permission" ||
    status === "connecting" ||
    status === "connected";

  return (
    <section className={styles.agent} aria-labelledby="spreekagent-title">
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

      <div className={styles.sessionBar}>
        <div className={styles.status} role="status" aria-live="polite">
          <span
            className={`${styles.statusDot} ${
              status === "connected" ? styles.statusDotActive : ""
            }`}
            aria-hidden="true"
          />
          <span>{statusLabel(status)}</span>
        </div>
        <div
          className={`${styles.timer} ${
            remainingSeconds <= 30 && isActive ? styles.timerUrgent : ""
          }`}
          aria-label={`Resterende gesprekstijd: ${formatTimer(remainingSeconds)}`}
        >
          <span className={styles.timerLabel}>Resterend</span>
          <span className={styles.timerValue}>{formatTimer(remainingSeconds)}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.startButton}
          onClick={() => void startConversation()}
          disabled={isActive}
        >
          Start gesprek
        </button>
        <button
          type="button"
          className={styles.endButton}
          onClick={() => finishSession("manual")}
          disabled={!isActive}
        >
          Beëindig
        </button>
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
          <span className={styles.transcriptNote}>Audio wordt niet opgeslagen</span>
        </div>

        <div className={styles.transcript} aria-live="polite" aria-relevant="additions">
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
              <span className={styles.speakerLabel}>
                {entry.speaker === "agent" ? "AI-agent" : "Kandidaat"}
              </span>
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

        {observations ? (
          <dl className={styles.observationGrid}>
            <div>
              <dt>Taakvervulling</dt>
              <dd>{observations.taskCompletion}</dd>
            </div>
            <div>
              <dt>Vloeiendheid</dt>
              <dd>{observations.fluency}</dd>
            </div>
            <div>
              <dt>Interactie</dt>
              <dd>{observations.interaction}</dd>
            </div>
          </dl>
        ) : (
          <p className={styles.observationsPlaceholder}>
            Na het gesprek verschijnen hier korte, beschrijvende observaties.
          </p>
        )}

        <p className={styles.phaseStatement}>
          Fase 3: de agent neemt af en observeert. Het oordeel blijft bij de
          menselijke examinator.
        </p>
      </aside>

      <audio ref={audioRef} autoPlay className={styles.remoteAudio} aria-hidden="true" />
    </section>
  );
}
