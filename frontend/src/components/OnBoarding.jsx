// components/OnBoarding.jsx
import { useState } from "react";
import useSTTCheck from "../hooks/useSTTCheck";
import useSpeakerCheck from "../hooks/useSpeakerCheck";

export default function Onboarding() {
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => Math.min(s + 1, 10));
  const back = () => setStep((s) => Math.max(s - 1, 1));
  //  Console.log
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

  return (
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
        {/* Progress */}
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
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl mt-24">
          {step === 1 && (
            <>
              <div className="text-6xl mb-4">👋</div>

              <h2 className="text-3xl font-bold text-white">
                Welcome to SpeakUp!
              </h2>

              <p className="text-gray-400 mt-3">
                Let's get everything ready. It only takes about 1 minute.
              </p>

              <button
                onClick={next}
                className="mt-8 w-full rounded-xl bg-indigo-600!! py-3!! text-white font-semibold hover:bg-indigo-500!"
              >
                Get Started
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-5xl mb-4">✍️</div>

              <h2 className="text-2xl text-white font-bold">
                Tell Us About You
              </h2>

              <p className="text-gray-400 mt-2">What should we call you?</p>

              <input
                className="mt-6 w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white"
                placeholder="Nickname"
              />

              <p className="mt-3 text-sm text-gray-500">
                This name will be used when your AI tutor talks to you.
              </p>

              <button
                onClick={next}
                className="mt-8 w-full rounded-xl bg-indigo-600!! py-3!! text-white"
              >
                Continue
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-5xl mb-4">🎤</div>

              <h2 className="text-2xl font-bold text-white">
                Microphone Check
              </h2>

              <p className="mt-2 text-gray-400">
                We'll verify that your microphone is connected and can detect
                your voice.
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
                  className={audioDetected ? "text-green-400" : "text-gray-400"}
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

          {step === 4 && (
            <>
              <div className="text-5xl mb-4">🗣️</div>

              <h2 className="text-2xl font-bold text-white">
                Speech Recognition Check
              </h2>

              <p className="mt-2 text-gray-400">
                Read the sentence below to test both speech recognition engines.
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
                  <h3 className="text-white font-semibold">Whisper STT</h3>

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

          {step === 5 && (
            <>
              <div className="mt-6 rounded-xl bg-slate-800 p-5">
                <div
                  className={isPlaying ? "text-yellow-400" : "text-gray-400"}
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

          {step === 6 && (
            <>
              <div className="text-5xl mb-4">📖</div>

              <h2 className="text-2xl text-white font-bold">Meet SpeakUp</h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-slate-800 p-4">
                  <h3>📚 Learn Vocabulary</h3>
                  <p className="text-gray-400">Master useful English words.</p>
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

          {step === 7 && (
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

          {step === 8 && (
            <>
              <div className="text-5xl mb-4">📊</div>

              <h2 className="text-2xl text-white font-bold">Placement Test</h2>

              <p className="mt-3 text-gray-400">Estimated time: 1 minute</p>

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

          {step === 9 && (
            <>
              <div className="text-5xl mb-4">🔥</div>

              <h2 className="text-2xl text-white font-bold">Daily Goal</h2>

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

          {step === 10 && (
            <>
              <div className="text-6xl mb-4">🎮</div>

              <h2 className="text-3xl text-white font-bold">Welcome Mission</h2>

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
  );
}
