// components/OnBoarding.jsx
import { useState, useEffect, useRef } from "react";
import useSTTCheck from "../hooks/useSTTCheck";
import useSpeakerCheck from "../hooks/useSpeakerCheck";

import AvatarModal from "./AvatarModal";
import { AVATARS } from "../utils/avatars";

import useOnboarding from "../hooks/useOnboarding";

export default function Onboarding({
  handleSaveAvatar,
  showAvatarModal,
  setShowAvatarModal,
  selectedAvatar,
  setSelectedAvatar,
}) {
  const [step, setStep] = useState(9);

  const next = () => setStep((s) => Math.min(s + 1, 10));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const [voiceCheckStage, setVoiceCheckStage] = useState("microphone");
  // microphone | speaker

  const [STTStep, setSTTStep] = useState(0);
  const [selfConfidence, setSelfConfidence] = useState("");
  const [speakingAnxiety, setSpeakingAnxiety] = useState("");

  const [confidenceStep, setConfidenceStep] = useState(0);

  const [goalStep, setGoalStep] = useState(0);
  const [learningGoal, setLearningGoal] = useState("");

  const {
    motherTongue,
    setMotherTongue,
    englishUsage,
    setEnglishUsage,

    deviceType,
    browserName,
    operatingSystem,

    micAvailable,
    micPermissionGranted,
    micPermissionDenied,

    mediaRecorderSupported,
    webAudioSupported,

    speechRecognitionSupported,
    speechSynthesisSupported,

    systemReady,
    runSystemCheck,

    isRecording,
    audioURL,

    micLevel,
    micDetected,
    maxMicLevel,

    startRecording,
    stopRecording,
    recordAgain,
    languages,

    speakerConfirmed,
    setSpeakerConfirmed,
    voiceConfirmed,
    setVoiceConfirmed,
    voiceTestPassed,
    setVoiceTestPassed,

    VOICE_THRESHOLD,
  } = useOnboarding();

  // console.log("micLevel :", micLevel);
  // console.log("micDetected :", micDetected);

  const {
    permissionGranted,
    audioDetected,

    googleRunning,
    googleTranscript,
    googlePassed,

    whisperRunning,
    whisperTranscript,
    whisperPassed,

    checkMicrophone,

    startGoogleCheck,
    stopGoogleCheck,

    startWhisperCheck,
    stopWhisperCheck,

    micLevel: micLevelWhisper,
    micDetected: micDetectedWhisper,
  } = useSTTCheck();

  const {
    audioRef,
    isPlaying,
    passed: speakerPassed,
    playSample,
    confirmHeard,
    setIsPlaying,
  } = useSpeakerCheck();

  const currentAvatar =
    AVATARS.find((a) => a.id === selectedAvatar)?.avatar ?? "🙂";

  const renderStatus = (value) => {
    if (value === null) return "⏳";
    return value ? "✅" : "❌";
  };

  // return null;
  return (
    <>
      <div className="min-h-screenflex items-center justify-center p-6">
        <audio
          ref={audioRef}
          src="/src/assets/sound/freetalk_start.mp3"
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onEnded={() => setIsPlaying(false)}
        />
        ;
        <div className="w-full max-w-xl">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {step} / 10</span>
              <span>{Math.round((step / 10) * 100)}%</span>
            </div>

            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${step * 10}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div
            className={`rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl ${
              step === 1 || step === 2 || step === 3 ? "mt-20" : "mt-12"
            }`}
          >
            {step === 1 && (
              <div className="flex flex-col items-center text-center">
                {/* Welcome Icon */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/20 backdrop-blur">
                  <span className="text-5xl">👋</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Welcome to <span className="text-indigo-400">SpeakUp</span>
                </h2>

                {/* Subtitle */}
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                  Let's personalize your learning experience and make sure
                  everything is ready before you start speaking English.
                </p>

                {/* Time Badge */}
                <div className="mt-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
                  ⏱ Takes about{" "}
                  <span className="font-semibold text-white">1 minute</span>
                </div>

                {/* CTA */}
                <button
                  onClick={next}
                  className="
                    mt-10
                    w-full
                    rounded-2xl
                    bg-indigo-600!
                    py-3.5!
                    text-base
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-indigo-500/30
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-indigo-500!
                    active:translate-y-0
                  "
                >
                  Get Started →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/20 backdrop-blur">
                  <span className="text-5xl">✍️</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  What should we call you?
                </h2>

                {/* Subtitle */}
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                  Choose a nickname you'd like your AI tutor to use during
                  conversations.
                </p>

                {/* Input */}
                <input
                  className="
                    mt-8
                    w-full
                    rounded-2xl
                    border border-white/10
                    bg-white/5!
                    px-4!
                    py-3.5!
                    text-center
                    text-white
                    placeholder:text-white/40
                    outline-none
                    transition-all
                    focus:border-indigo-400
                    focus:ring-4
                    focus:ring-indigo-500/20
                  "
                  placeholder="Enter your nickname"
                />

                {/* Helper */}
                <p className="mt-3 text-xs text-white/50">
                  You can change it anytime in Settings.
                </p>

                {/* Button */}
                <button
                  onClick={next}
                  className="
                    mt-10
                    w-full
                    rounded-2xl
                    bg-indigo-600!
                    py-3.5!
                    text-base!
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-indigo-500/30
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-indigo-500!
                    active:translate-y-0
                  "
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center text-center">
                {/* Avatar Preview */}
                <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/20 backdrop-blur">
                  <span className="text-6xl">{currentAvatar || "🙂"}</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Choose Your Avatar
                </h2>

                {/* Subtitle */}
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                  Pick an avatar that represents you. You can always change it
                  later in Settings.
                </p>

                {/* Open Avatar Modal */}
                <button
                  onClick={() => {
                    setShowAvatarModal(true);
                  }}
                  className="
                    mt-8
                    w-full
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5!
                    py-3.5!
                    font-medium
                    text-white
                    transition-all
                    hover:bg-white/10
                  "
                >
                  {selectedAvatar ? "Change Avatar" : "Choose Avatar"}
                </button>

                {/* Continue */}
                <button
                  onClick={next}
                  disabled={!selectedAvatar}
                  className={`
                    mt-4
                    w-full
                    rounded-2xl
                    py-3.5!
                    text-base!
                    font-semibold
                    transition-all
                    duration-200
                    ${
                      selectedAvatar
                        ? "bg-indigo-600! text-white shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 hover:bg-indigo-500"
                        : "cursor-not-allowed bg-slate-700! text-slate-400"
                    }
                  `}
                >
                  Continue →
                </button>
                {!selectedAvatar && (
                  <p className="mt-3 text-sm text-amber-400">
                    Please choose an avatar before continuing.
                  </p>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/20 backdrop-blur">
                  <span className="text-5xl">🌏</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Which language do you speak most often?
                </h2>

                {/* Subtitle */}
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                  We'll use this to provide better explanations and translations
                  when needed.
                </p>

                {/* Languages */}
                <div className="mt-8 w-full max-h-40 space-y-3 overflow-y-auto pr-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setMotherTongue(lang.code)}
                      className={`
                        flex w-full items-center justify-between
                        rounded-2xl
                        border
                        px-5!
                        py-4!
                        transition-all
                        ${
                          motherTongue === lang.code
                            ? "border-indigo-500 bg-indigo-500/10!"
                            : "border-white/10 bg-white/5! hover:bg-white/10!"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-white">{lang.label}</span>
                      </div>

                      {motherTongue === lang.code && (
                        <span className="text-xl text-indigo-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Continue */}
                <button
                  onClick={next}
                  disabled={!motherTongue}
                  className={`
                    mt-8
                    w-full
                    rounded-2xl
                    py-3.5!
                    text-base
                    font-semibold
                    transition-all
                    ${
                      motherTongue
                        ? "bg-indigo-600! text-white hover:bg-indigo-500!"
                        : "cursor-not-allowed bg-slate-700 text-slate-400"
                    }
                  `}
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/20 backdrop-blur">
                  <span className="text-5xl">📈</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  How often do you use English?
                </h2>

                {/* Subtitle */}
                <p className="mt-4 max-w-sm text-sm text-white/70">
                  This helps us personalize your lessons and conversation
                  difficulty.
                </p>

                {/* Options */}
                <div className="mt-8 w-full space-y-3">
                  {[
                    {
                      id: "never",
                      emoji: "😅",
                      title: "Almost Never",
                      desc: "I rarely use English.",
                    },
                    {
                      id: "sometimes",
                      emoji: "🙂",
                      title: "Sometimes",
                      desc: "A few times each month.",
                    },
                    {
                      id: "weekly",
                      emoji: "😊",
                      title: "Every Week",
                      desc: "I use English regularly.",
                    },
                    {
                      id: "daily",
                      emoji: "🚀",
                      title: "Every Day",
                      desc: "English is part of my daily life.",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setEnglishUsage(item.id)}
                      className={`
                        w-full
                        rounded-2xl
                        border
                        p-4!
                        text-left
                        transition-all
                        ${
                          englishUsage === item.id
                            ? "border-indigo-500 bg-indigo-500/10!"
                            : "border-white/10 bg-white/5! hover:bg-white/10!"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{item.emoji}</span>

                        <div>
                          <div className="font-semibold text-white">
                            {item.title}
                          </div>

                          <div className="text-sm text-white/60">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Continue */}
                <button
                  onClick={next}
                  disabled={!englishUsage}
                  className={`
                    mt-8
                    w-full
                    rounded-2xl
                    py-3.5!
                    text-base!
                    font-semibold
                    transition-all
                    ${
                      englishUsage
                        ? "bg-indigo-600! text-white hover:bg-indigo-500!"
                        : "cursor-not-allowed bg-slate-700! text-slate-400"
                    }
                  `}
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 6 && (
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/20 backdrop-blur">
                  <span className="text-5xl">🖥️</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Automatic System Check
                </h2>

                {/* Subtitle */}
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                  We'll automatically verify your device and browser
                  capabilities before you start speaking.
                </p>

                {/* Checklist */}
                <div className="mt-8 w-full space-y-4">
                  {/* Device */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-4 text-left text-sm font-semibold text-white/80">
                      🖥 Device
                    </h3>

                    <div className="space-y-3 text-left">
                      <div className="flex justify-between">
                        <span className="text-white/70">Device Type</span>
                        <span className="text-emerald-500">
                          {deviceType || "⏳"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-white/70">Browser</span>
                        <span className="text-emerald-500">
                          {browserName || "⏳"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-white/70">Operating System</span>
                        <span className="text-emerald-500">
                          {operatingSystem || "⏳"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Audio */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-4 text-left text-sm font-semibold text-white/80">
                      🎤 Audio Support
                    </h3>

                    <div className="space-y-3 text-left">
                      <div className="flex justify-between">
                        <span className="text-white/70">
                          Microphone Available
                        </span>
                        <span>{renderStatus(micAvailable)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-white/70">
                          Microphone Permission
                        </span>
                        <span>{renderStatus(micPermissionGranted)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-white/70">MediaRecorder API</span>
                        <span>{renderStatus(mediaRecorderSupported)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-white/70">Web Audio API</span>
                        <span>{renderStatus(webAudioSupported)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Speech */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-4 text-left text-sm font-semibold text-white/80">
                      🗣 Speech Support
                    </h3>

                    <div className="space-y-3 text-left">
                      <div className="flex justify-between">
                        <span className="text-white/70">
                          Speech Recognition API
                        </span>
                        <span>{renderStatus(speechRecognitionSupported)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-white/70">Speech Synthesis</span>
                        <span>{renderStatus(speechSynthesisSupported)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={runSystemCheck}
                  className="mt-8 w-full rounded-2xl bg-indigo-600! py-3.5! font-semibold text-white transition hover:bg-indigo-500"
                >
                  Run Automatic Check
                </button>

                <button
                  onClick={next}
                  disabled={!systemReady}
                  className={`mt-4 w-full rounded-2xl py-3.5! font-semibold transition ${
                    systemReady
                      ? "bg-emerald-600! text-white hover:bg-emerald-500!"
                      : "cursor-not-allowed bg-slate-700! text-slate-400"
                  }`}
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 7 && (
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/20 backdrop-blur">
                  <span className="text-5xl">🎙️</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Voice Test
                </h2>

                {!audioURL && (
                  <>
                    {/* Subtitle */}
                    <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                      Record and play back your voice to confirm that your
                      microphone and speaker are working correctly.
                    </p>

                    {/* Prompt */}
                    <div className="mt-8 w-full rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5">
                      <p className="text-sm text-white/70">Please say:</p>

                      <p className="mt-2 text-xl font-semibold text-white">
                        "Hello, my name is..."
                      </p>
                    </div>
                  </>
                )}

                {/* Recording */}
                {isRecording && (
                  <div className="mt-6">
                    <div className="flex h-12 items-end justify-center gap-1">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const height = Math.max(
                          10,
                          micLevel * (1.5 + Math.random() * 0.8),
                        );

                        return (
                          <div
                            key={i}
                            className={`w-2 rounded-full transition-all duration-75 ${
                              micDetected ? "bg-red-500" : "bg-slate-500"
                            }`}
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* <p className="mt-3 text-sm text-white/70">
                      {micDetected
                        ? "🎤 Voice detected"
                        : "Waiting for your voice..."}
                    </p> */}
                  </div>
                )}

                {/* Playback & Confirmation */}
                {audioURL && (
                  <div className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-5">
                    {voiceCheckStage === "microphone" && (
                      <>
                        {/* Microphone Check */}
                        <p className="text-sm font-medium text-white">
                          🎤 Microphone Check
                        </p>

                        <p className="mt-1 text-sm text-white/60">
                          Voice input detection
                        </p>

                        <div
                          className={`mt-4 rounded-lg p-3 text-center font-semibold ${
                            maxMicLevel > VOICE_THRESHOLD
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {maxMicLevel > VOICE_THRESHOLD
                            ? "✅ Voice detected"
                            : "❌ No voice detected"}
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-white/70">Voice Level</p>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all"
                              style={{
                                width: `${Math.min(maxMicLevel, 100)}%`,
                              }}
                            />
                          </div>

                          <p className="mt-2 text-center text-sm text-white">
                            {maxMicLevel.toFixed(1)}
                          </p>
                        </div>

                        <p className="mt-3 text-center text-xs text-white/50">
                          Detection threshold: &gt; {VOICE_THRESHOLD}
                        </p>

                        <button
                          disabled={maxMicLevel <= VOICE_THRESHOLD}
                          onClick={() => setVoiceCheckStage("speaker")}
                          className={`mt-6 w-full rounded-xl p-3! font-semibold ${
                            maxMicLevel > VOICE_THRESHOLD
                              ? "bg-indigo-600! text-white hover:bg-indigo-500"
                              : "cursor-not-allowed bg-slate-700! text-slate-400"
                          }`}
                        >
                          Continue to Speaker Check →
                        </button>
                      </>
                    )}

                    {voiceCheckStage === "speaker" && (
                      <>
                        {/* Speaker Check */}
                        <p className="text-sm font-medium text-white">
                          🔊 Speaker Check
                        </p>

                        <p className="mt-2 text-sm text-white/70">
                          Play your recording, then answer the question below.
                        </p>

                        <div className="mt-5">
                          <audio controls src={audioURL} className="w-full" />
                        </div>

                        <p className="mt-6 text-sm text-white/70">
                          Could you hear your recording clearly?
                        </p>

                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => {
                              setSpeakerConfirmed(true);
                              setVoiceTestPassed(true);
                            }}
                            className="flex-1 rounded-xl bg-emerald-600 py-3 font-semibold text-white"
                          >
                            👍 Yes
                          </button>

                          <button
                            onClick={() => {
                              setSpeakerConfirmed(false);
                              setVoiceTestPassed(false);
                            }}
                            className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white"
                          >
                            👎 No
                          </button>
                        </div>

                        {speakerConfirmed === true && (
                          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <div className="flex justify-between text-white">
                              <span>Speaker</span>
                              <span>✅ Working</span>
                            </div>
                          </div>
                        )}

                        {speakerConfirmed === false && (
                          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                            We couldn't confirm your speaker.
                            <br />
                            Please check your speaker volume or audio output
                            device, then play the recording again.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Buttons */}
                {!audioURL ? (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`mt-8 w-full rounded-2xl py-3.5! font-semibold text-white transition ${
                      isRecording
                        ? "bg-red-600! hover:bg-red-500!"
                        : "bg-indigo-600! hover:bg-indigo-500!"
                    }`}
                  >
                    {isRecording ? "■ Stop Recording" : "🎙 Start Recording"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        recordAgain();
                        setVoiceCheckStage("microphone");
                      }}
                      className="mt-8 w-full rounded-2xl bg-slate-700! py-3.5! font-semibold text-white transition hover:bg-slate-600"
                    >
                      🔄 Record Again
                    </button>

                    <button
                      onClick={next}
                      disabled={!voiceTestPassed}
                      className={`mt-4 w-full rounded-2xl py-3.5! font-semibold transition ${
                        voiceTestPassed
                          ? "bg-emerald-600! text-white hover:bg-emerald-500"
                          : "cursor-not-allowed bg-slate-700 text-slate-400"
                      }`}
                    >
                      Continue →
                    </button>
                  </>
                )}
              </div>
            )}

            {step === 8 && (
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/20 backdrop-blur">
                  <span className="text-5xl">🗣️</span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Speech Recognition Check
                </h2>

                {/* Prompt */}
                <div className="mt-2 w-full rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3">
                  <p className="text-sm text-white/70">Please say:</p>

                  <p className="mt-1 text-xl font-semibold text-white">
                    "Hello, my name is..."
                  </p>
                </div>

                {/* Step 0 */}
                {STTStep === 0 && (
                  <>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                      We will test browser and AI speech recognition.
                    </p>

                    <button
                      onClick={() => setSTTStep(1)}
                      className="mt-8 w-full rounded-2xl bg-indigo-600! py-3.5! font-semibold text-white hover:bg-indigo-500!"
                    >
                      Next →
                    </button>
                  </>
                )}

                {/* Google Check */}
                {STTStep === 1 && (
                  <div className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                    <h3 className="font-semibold text-white">
                      🌐 Browser Speech Recognition
                    </h3>

                    <span
                      className={`text-sm ${
                        googlePassed
                          ? "text-emerald-300"
                          : googleRunning
                            ? "text-yellow-300"
                            : "text-white/50"
                      }`}
                    >
                      {googlePassed
                        ? "✅ Passed"
                        : googleRunning
                          ? "🎙 Listening..."
                          : "Not Checked"}
                    </span>

                    <div className="mt-4 min-h-16 rounded-xl bg-black/20 p-4 text-sm text-white/70">
                      {googleTranscript || "No transcript yet."}
                    </div>

                    {!googleRunning && !googlePassed && (
                      <button
                        onClick={startGoogleCheck}
                        className="mt-5 w-full rounded-xl bg-indigo-600! py-3! font-semibold text-white"
                      >
                        🎙 Start Test
                      </button>
                    )}

                    {googlePassed && (
                      <button
                        onClick={() => setSTTStep(2)}
                        className="mt-5 w-full rounded-xl bg-emerald-600! py-3! font-semibold text-white"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                )}

                {/* Whisper Check */}
                {STTStep === 2 && (
                  <div className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                    <h3 className="font-semibold text-white">
                      🤖 Whisper Speech Recognition
                    </h3>

                    <span
                      className={`text-sm ${
                        whisperPassed
                          ? "text-emerald-300"
                          : whisperRunning
                            ? "text-yellow-300"
                            : "text-white/50"
                      }`}
                    >
                      {whisperPassed
                        ? "✅ Passed"
                        : whisperRunning
                          ? "🎙 Recording..."
                          : "Not Checked"}
                    </span>

                    <div className="mt-4 min-h-16 rounded-xl bg-black/20 p-4 text-sm text-white/70">
                      {whisperTranscript || "No transcript yet."}
                    </div>

                    {!whisperRunning && !whisperPassed && (
                      <button
                        onClick={async () => {
                          const micReady = await checkMicrophone();

                          if (micReady) {
                            startWhisperCheck();
                          }
                        }}
                        className="mt-5 w-full rounded-xl bg-violet-600! py-3! font-semibold text-white transition hover:bg-violet-500"
                      >
                        🎙 Start Test
                      </button>
                    )}

                    {whisperRunning && (
                      <>
                        {/* Recording Visualizer */}
                        <div className="mt-6">
                          <div className="flex h-12 items-end justify-center gap-1">
                            {Array.from({ length: 10 }).map((_, i) => {
                              const height = Math.max(
                                8,
                                micLevelWhisper * (0.4 + Math.random() * 0.6),
                              );

                              return (
                                <div
                                  key={i}
                                  className={`w-2 rounded-full transition-all duration-75 ${
                                    micDetectedWhisper
                                      ? "bg-violet-500"
                                      : "bg-slate-500"
                                  }`}
                                  style={{
                                    height: `${height}%`,
                                  }}
                                />
                              );
                            })}
                          </div>

                          <p className="mt-3 text-center text-sm text-white/70">
                            {micDetectedWhisper
                              ? "🎤 Voice detected"
                              : "Waiting for your voice..."}
                          </p>

                          <p className="mt-2 text-center text-xs text-amber-300">
                            Whisper keeps recording until you click{" "}
                            <span className="font-semibold text-white">
                              Stop Recording
                            </span>
                            .
                          </p>
                        </div>

                        <button
                          onClick={stopWhisperCheck}
                          className="mt-6 w-full rounded-xl bg-red-600! py-3! font-semibold text-white transition hover:bg-red-500"
                        >
                          ■ Stop Recording
                        </button>
                      </>
                    )}

                    {whisperPassed && (
                      <button
                        onClick={next}
                        className="mt-6 w-full rounded-2xl bg-emerald-600! py-3.5! font-semibold text-white"
                      >
                        Continue →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 9 && (
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/20 backdrop-blur">
                  <span className="text-5xl">😊</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Speaking Confidence
                </h2>

                {/* Intro */}
                {confidenceStep === 0 && (
                  <>
                    <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                      Help us personalize your speaking practice.
                    </p>

                    <button
                      onClick={() => setConfidenceStep(1)}
                      className="mt-8 w-full rounded-2xl bg-indigo-600! py-3.5! text-base font-semibold text-white transition-all hover:bg-indigo-500!"
                    >
                      Next →
                    </button>
                  </>
                )}

                {/* Self Confidence */}
                {confidenceStep === 1 && (
                  <div className="mt-8 w-full">
                    <p className="mb-3 text-left text-sm font-medium text-white">
                      Self Confidence Level
                    </p>

                    <div className="space-y-3">
                      {[
                        "😟 Very Low",
                        "😕 Low",
                        "😐 Moderate",
                        "🙂 High",
                        "😄 Very High",
                      ].map((level) => (
                        <button
                          key={level}
                          onClick={() => setSelfConfidence(level)}
                          className={`
                flex w-full items-center justify-between
                rounded-2xl
                border
                px-5!
                py-4!
                transition-all
                ${
                  selfConfidence === level
                    ? "border-indigo-500 bg-indigo-500/10!"
                    : "border-white/10 bg-white/5! hover:bg-white/10!"
                }
              `}
                        >
                          <span className="text-white">{level}</span>

                          {selfConfidence === level && (
                            <span className="text-xl text-indigo-400">✓</span>
                          )}
                        </button>
                      ))}
                    </div>

                    {selfConfidence && (
                      <button
                        onClick={() => setConfidenceStep(2)}
                        className="mt-8 w-full rounded-2xl bg-indigo-600! py-3.5! text-base font-semibold text-white transition-all hover:bg-indigo-500!"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                )}

                {/* Speaking Anxiety */}
                {confidenceStep === 2 && (
                  <div className="mt-8 w-full">
                    <p className="mb-3 text-left text-sm font-medium text-white">
                      Speaking Anxiety
                    </p>

                    <div className="space-y-3">
                      {[
                        "😌 Very Relaxed",
                        "🙂 Slightly Nervous",
                        "😐 Moderately Nervous",
                        "😟 Very Nervous",
                        "😰 Extremely Nervous",
                      ].map((level) => (
                        <button
                          key={level}
                          onClick={() => setSpeakingAnxiety(level)}
                          className={`
                flex w-full items-center justify-between
                rounded-2xl
                border
                px-5!
                py-4!
                transition-all
                ${
                  speakingAnxiety === level
                    ? "border-indigo-500 bg-indigo-500/10!"
                    : "border-white/10 bg-white/5! hover:bg-white/10!"
                }
              `}
                        >
                          <span className="text-white">{level}</span>

                          {speakingAnxiety === level && (
                            <span className="text-xl text-indigo-400">✓</span>
                          )}
                        </button>
                      ))}
                    </div>

                    {speakingAnxiety && (
                      <button
                        onClick={next}
                        className="mt-8 w-full rounded-2xl bg-emerald-600! py-3.5! text-base font-semibold text-white transition-all hover:bg-emerald-500!"
                      >
                        Continue →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 10 && (
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/20 backdrop-blur">
                  <span className="text-5xl">🎯</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Learning Goals
                </h2>

                {/* Intro */}
                {goalStep === 0 && (
                  <>
                    <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                      Tell us your main goal for learning English.
                    </p>

                    <button
                      onClick={() => setGoalStep(1)}
                      className="mt-8 w-full rounded-2xl bg-indigo-600! py-3.5! text-base font-semibold text-white transition-all hover:bg-indigo-500!"
                    >
                      Next →
                    </button>
                  </>
                )}

                {/* Goal Selection */}
                {goalStep === 1 && (
                  <div className="mt-8 w-full">
                    <p className="mb-3 text-left text-sm font-medium text-white">
                      What is your primary goal?
                    </p>

                    <div className="space-y-3">
                      {[
                        "🗣️ Improve Speaking",
                        "💼 Career & Work",
                        "🎓 Study Abroad",
                        "✈️ Travel",
                        "🤝 Daily Conversation",
                        "📚 General English",
                      ].map((goal) => (
                        <button
                          key={goal}
                          onClick={() => setLearningGoal(goal)}
                          className={`
                flex w-full items-center justify-between
                rounded-2xl
                border
                px-5!
                py-4!
                transition-all
                ${
                  learningGoal === goal
                    ? "border-indigo-500 bg-indigo-500/10!"
                    : "border-white/10 bg-white/5! hover:bg-white/10!"
                }
              `}
                        >
                          <span className="text-white">{goal}</span>

                          {learningGoal === goal && (
                            <span className="text-xl text-indigo-400">✓</span>
                          )}
                        </button>
                      ))}
                    </div>

                    {learningGoal && (
                      <button
                        onClick={next}
                        className="mt-8 w-full rounded-2xl bg-emerald-600! py-3.5! text-base font-semibold text-white transition-all hover:bg-emerald-500!"
                      >
                        Continue →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {false && (
              <>
                {step === 9 && (
                  <>
                    <div className="mt-6 rounded-xl bg-slate-800 p-5">
                      <div
                        className={
                          isPlaying ? "text-yellow-400" : "text-gray-400"
                        }
                      >
                        {isPlaying ? "🔊 Playing sample..." : "Ready"}
                      </div>
                    </div>

                    <button
                      onClick={playSample}
                      className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-white"
                    >
                      🔁 Play Sample
                    </button>

                    <button
                      onClick={confirmHeard}
                      className="mt-4 w-full rounded-xl bg-green-600 py-3 text-white"
                    >
                      ✅ I Heard the Sound
                    </button>

                    {speakerPassed && (
                      <button
                        onClick={next}
                        className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-white"
                      >
                        Continue
                      </button>
                    )}
                  </>
                )}

                {step === 10 && (
                  <>
                    <div className="text-5xl mb-4">📖</div>

                    <h2 className="text-2xl text-white font-bold">
                      Meet SpeakUp
                    </h2>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-xl bg-slate-800 p-4">
                        <h3>📚 Learn Vocabulary</h3>
                        <p className="text-gray-400">
                          Master useful English words.
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-800 p-4">
                        <h3>🗣️ Practice Speaking</h3>
                        <p className="text-gray-400">Improve pronunciation.</p>
                      </div>

                      <div className="rounded-xl bg-slate-800 p-4">
                        <h3>🤖 Talk with AI</h3>
                        <p className="text-gray-400">
                          Practice natural conversations.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={next}
                      className="flex-1 rounded-xl bg-green-600 py-3! text-white"
                    >
                      ✅ Yes
                    </button>
                  </>
                )}

                {step === 11 && (
                  <>
                    <div className="text-5xl mb-4">🎯</div>

                    <h2 className="text-2xl text-white font-bold">
                      What's Your Goal?
                    </h2>

                    <div className="mt-6 space-y-3">
                      {[
                        "Daily Conversation",
                        "Travel",
                        "Business",
                        "IELTS",
                        "TOEFL",
                        "Just for Fun",
                      ].map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-3 rounded-xl bg-slate-800 p-4 cursor-pointer"
                        >
                          <input type="radio" name="goal" />
                          {item}
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={next}
                      className="flex-1 rounded-xl bg-green-600 py-3! text-white"
                    >
                      ✅ Yes
                    </button>
                  </>
                )}

                {step === 12 && (
                  <>
                    <div className="text-5xl mb-4">📊</div>

                    <h2 className="text-2xl text-white font-bold">
                      Placement Test
                    </h2>

                    <p className="mt-3 text-gray-400">
                      Estimated time: 1 minute
                    </p>

                    <div className="mt-8 flex gap-4">
                      <button
                        onClick={next}
                        className="flex-1 bg-indigo-600! rounded-xl py-3! text-white"
                      >
                        Start Test
                      </button>

                      <button className="flex-1 bg-slate-700! rounded-xl py-3! text-white">
                        Skip
                      </button>
                    </div>
                  </>
                )}

                {step === 13 && (
                  <>
                    <div className="text-5xl mb-4">🔥</div>

                    <h2 className="text-2xl text-white font-bold">
                      Daily Goal
                    </h2>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      {[5, 10, 20, 30].map((m) => (
                        <button
                          onClick={next}
                          key={m}
                          className="rounded-xl bg-slate-800! p-5! text-white hover:bg-indigo-600!"
                        >
                          {m} min
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {step === 14 && (
              <>
                <div className="text-6xl mb-4">🎮</div>

                <h2 className="text-3xl text-white font-bold">
                  Welcome Mission
                </h2>

                <div className="mt-8 rounded-xl bg-slate-800 p-5">
                  <h3 className="font-bold text-white">🎤 Say Hello</h3>

                  <p className="text-yellow-400 mt-2">Reward: +10 XP</p>
                </div>

                <button
                  onClick={next}
                  className="mt-8 w-full rounded-xl bg-yellow-500! py-3! font-bold"
                >
                  Start Mission
                </button>
              </>
            )}
          </div>

          {step > 1 && (
            <button
              onClick={back}
              className="mt-4 text-gray-400 hover:text-white"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      <AvatarModal
        open={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        selectedAvatar={selectedAvatar}
        setSelectedAvatar={setSelectedAvatar}
        onSave={handleSaveAvatar}
      />
    </>
  );
}
