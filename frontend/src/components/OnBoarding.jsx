// components/OnBoarding.jsx
import { useState } from "react";
import useSTTCheck from "../hooks/useSTTCheck";
import useSpeakerCheck from "../hooks/useSpeakerCheck";

import AvatarModal from "./AvatarModal";
import { AVATARS } from "../utils/avatars";

export default function Onboarding({
  handleSaveAvatar,
  showAvatarModal,
  setShowAvatarModal,
  selectedAvatar,
  setSelectedAvatar,
}) {
  const [step, setStep] = useState(1);
  const [motherTongue, setMotherTongue] = useState(false);
  const [englishUsage, setEnglishUsage] = useState("");

  const next = () => setStep((s) => Math.min(s + 1, 10));
  const back = () => setStep((s) => Math.max(s - 1, 1));

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

  const languages = [
    { code: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
    { code: "jv", flag: "🇮🇩", label: "Bahasa Jawa" },
    { code: "su", flag: "🇮🇩", label: "Bahasa Sunda" },
    { code: "mad", flag: "🇮🇩", label: "Bahasa Madura" },
    { code: "min", flag: "🇮🇩", label: "Bahasa Minangkabau" },
    { code: "bug", flag: "🇮🇩", label: "Bahasa Bugis" },
    { code: "ban", flag: "🇮🇩", label: "Bahasa Banjar" },
    { code: "ace", flag: "🇮🇩", label: "Bahasa Aceh" },
    { code: "bal", flag: "🇮🇩", label: "Bahasa Bali" },
    { code: "sas", flag: "🇮🇩", label: "Bahasa Sasak" },
    { code: "day", flag: "🇮🇩", label: "Bahasa Dayak" },
    { code: "btk", flag: "🇮🇩", label: "Bahasa Batak" },
    { code: "pap", flag: "🇮🇩", label: "Bahasa Papua" },
    { code: "other", flag: "🌍", label: "Other" },
  ];

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
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl mt-20">
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
                  What's your native language?
                </h2>

                {/* Subtitle */}
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                  We'll use this to provide better explanations and translations
                  when needed.
                </p>

                {/* Languages */}
                <div className="mt-8 w-full max-h-80 space-y-3 overflow-y-auto pr-1">
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
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
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
                  <span className="text-5xl">🎤</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold tracking-tight text-white">
                  Let's Check Your Device
                </h2>

                {/* Subtitle */}
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
                  We'll automatically check your microphone, speaker, and speech
                  recognition to make sure everything is ready.
                </p>

                {/* Checklist */}
                <div className="mt-8 w-full space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                    <span className="text-white">🎤 Microphone</span>

                    <span>{permissionGranted ? "✅" : "⏳"}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                    <span className="text-white">🔊 Speaker</span>

                    <span>{speakerPassed ? "✅" : "⏳"}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                    <span className="text-white">🗣 Speech Recognition</span>

                    <span>{googlePassed || whisperPassed ? "✅" : "⏳"}</span>
                  </div>
                </div>

                {/* Detect Button */}
                <button
                  onClick={async () => {
                    await checkMicrophone();
                  }}
                  className="mt-8 w-full rounded-2xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-500"
                >
                  Start Device Check
                </button>

                {/* Continue */}
                <button
                  onClick={next}
                  disabled={
                    !(
                      permissionGranted &&
                      speakerPassed &&
                      (googlePassed || whisperPassed)
                    )
                  }
                  className={`
                    mt-4
                    w-full
                    rounded-2xl
                    py-3.5!
                    font-semibold
                    transition-all
                    ${
                      permissionGranted &&
                      speakerPassed &&
                      (googlePassed || whisperPassed)
                        ? "bg-emerald-600! text-white hover:bg-emerald-500"
                        : "cursor-not-allowed bg-slate-700 text-slate-400"
                    }
                  `}
                >
                  Continue →
                </button>
              </div>
            )}

            {false && (
              <>
                {step === 7 && (
                  <>
                    <div className="text-5xl mb-4">🎤</div>

                    <h2 className="text-2xl font-bold text-white">
                      Microphone Check
                    </h2>

                    <p className="mt-2 text-gray-400">
                      We'll verify that your microphone is connected and can
                      detect your voice.
                    </p>

                    <div className="mt-8 rounded-xl bg-slate-800 p-5 space-y-3">
                      <div
                        className={
                          permissionGranted ? "text-green-400" : "text-gray-400"
                        }
                      >
                        {permissionGranted
                          ? "✅ Microphone permission granted"
                          : "⏳ Permission not granted"}
                      </div>

                      <div
                        className={
                          audioDetected ? "text-green-400" : "text-gray-400"
                        }
                      >
                        {audioDetected
                          ? "✅ Voice detected"
                          : "⏳ Waiting for your voice"}
                      </div>
                    </div>

                    {!audioDetected ? (
                      <button
                        onClick={checkMicrophone}
                        className="mt-8 w-full rounded-xl bg-indigo-600 py-3 text-white"
                      >
                        Check Microphone
                      </button>
                    ) : (
                      <button
                        onClick={next}
                        className="mt-8 w-full rounded-xl bg-green-600 py-3 text-white"
                      >
                        Continue
                      </button>
                    )}
                  </>
                )}

                {step === 8 && (
                  <>
                    <div className="text-5xl mb-4">🗣️</div>

                    <h2 className="text-2xl font-bold text-white">
                      Speech Recognition Check
                    </h2>

                    <p className="mt-2 text-gray-400">
                      Read the sentence below to test both speech recognition
                      engines.
                    </p>

                    {/* Sentence */}
                    <div className="mt-6 rounded-xl bg-slate-800 p-5">
                      <p className="text-gray-400">Please say:</p>

                      <h3 className="text-2xl text-white font-semibold mt-2">
                        "Hello, how are you?"
                      </h3>
                    </div>

                    {/* Google */}
                    <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-white font-semibold">
                          Google Speech Recognition
                        </h3>

                        <span
                          className={
                            googlePassed
                              ? "text-green-400"
                              : googleRunning
                                ? "text-yellow-400"
                                : "text-gray-400"
                          }
                        >
                          {googlePassed
                            ? "Passed"
                            : googleRunning
                              ? "Listening..."
                              : "Not Checked"}
                        </span>
                      </div>

                      <div className="rounded-lg bg-slate-900 p-3 min-h-16 text-gray-300">
                        {googleTranscript || "No transcript yet."}
                      </div>

                      {!googleRunning && !googlePassed && (
                        <button
                          onClick={startGoogleCheck}
                          className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-white"
                        >
                          Test Google Speech
                        </button>
                      )}

                      {googleRunning && (
                        <button
                          onClick={stopGoogleCheck}
                          className="mt-4 w-full rounded-xl bg-red-600 py-3 text-white"
                        >
                          Stop Recording
                        </button>
                      )}
                    </div>

                    {/* Whisper */}
                    <div className="mt-5 rounded-xl border border-slate-700 bg-slate-800 p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-white font-semibold">
                          Whisper STT
                        </h3>

                        <span
                          className={
                            whisperPassed
                              ? "text-green-400"
                              : whisperRunning
                                ? "text-yellow-400"
                                : "text-gray-400"
                          }
                        >
                          {whisperPassed
                            ? "Passed"
                            : whisperRunning
                              ? "Recording..."
                              : "Not Checked"}
                        </span>
                      </div>

                      <div className="rounded-lg bg-slate-900 p-3 min-h-16 text-gray-300">
                        {whisperTranscript || "No transcript yet."}
                      </div>

                      {!whisperRunning && !whisperPassed && (
                        <button
                          onClick={startWhisperCheck}
                          className="mt-4 w-full rounded-xl bg-violet-600 py-3 text-white"
                        >
                          Test Whisper
                        </button>
                      )}

                      {whisperRunning && (
                        <button
                          onClick={stopWhisperCheck}
                          className="mt-4 w-full rounded-xl bg-red-600 py-3 text-white"
                        >
                          Stop Recording
                        </button>
                      )}
                    </div>

                    {/* Continue */}
                    {googlePassed && whisperPassed && (
                      <button
                        onClick={next}
                        className="mt-8 w-full rounded-xl bg-green-600 py-3 text-white font-semibold"
                      >
                        Continue
                      </button>
                    )}
                  </>
                )}

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
