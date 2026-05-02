import { useState } from "react";

export default function SentenceUI() {
  const [step, setStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");

  const context =
    "Your friend invites you to a party, but you are not sure you want to go.";

  const idealAnswers = [
    "I’m not sure I can make it.",
    "Let me think about it.",
  ];

  const variations = [
    "I might have other plans.",
    "I’ll get back to you.",
    "Sounds fun, but I’m not sure yet.",
  ];

  const nextStep = () => setStep((prev) => prev + 1);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 mt-36 text-white">
      {/* STEP 1: CONTEXT */}
      {step === 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">🎬 Situation</h2>
          <p className="bg-gray-100 p-4 rounded text-black">{context}</p>

          <button onClick={nextStep} className="btn mt-4">
            Continue
          </button>
        </div>
      )}

      {/* STEP 2: USER ATTEMPT */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-2">🧠 What would you say?</h2>

          <textarea
            className="w-full p-3 border rounded"
            placeholder="Type your response..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />

          <button onClick={nextStep} className="btn mt-4">
            Submit
          </button>
        </div>
      )}

      {/* STEP 3: REVEAL IDEAL */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-2">💡 Natural Expressions</h2>

          <div className="space-y-2">
            {idealAnswers.map((ans, i) => (
              <div key={i} className="bg-green-100 p-3 rounded text-black">
                {ans}
              </div>
            ))}
          </div>

          <button onClick={nextStep} className="btn mt-4">
            Practice
          </button>
        </div>
      )}

      {/* STEP 4: SHADOWING */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-2">🔁 Repeat After AI</h2>

          {idealAnswers.map((ans, i) => (
            <div key={i} className="mb-3">
              <p className="font-semibold">{ans}</p>
              <button className="btn-small">▶ Play</button>
              <button className="btn-small ml-2">🎤 Record</button>
            </div>
          ))}

          <button onClick={nextStep} className="btn mt-4">
            Next
          </button>
        </div>
      )}

      {/* STEP 5: VARIATIONS */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold mb-2">🔄 Variations</h2>

          {variations.map((v, i) => (
            <div key={i} className="bg-blue-100 text-black p-3 rounded mb-2">
              {v}
            </div>
          ))}

          <button onClick={nextStep} className="btn mt-4">
            Final Challenge
          </button>
        </div>
      )}

      {/* STEP 6: SPEED RECALL */}
      {step === 5 && (
        <div>
          <h2 className="text-xl font-bold mb-2">⚡ Quick Response</h2>

          <p className="mb-3">{context}</p>

          <textarea
            className="w-full p-3 border rounded"
            placeholder="Respond quickly..."
          />

          <button className="btn mt-4">Finish</button>
        </div>
      )}
    </div>
  );
}
