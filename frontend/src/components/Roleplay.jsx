import { useState } from "react";
import { streamChat } from "../services/chatService";

export default function Roleplay() {
  const [messages, setMessages] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(0); // main scenario

  const handleStreamUpdate = (aiText) => {
    setMessages((prev) => [...prev.slice(0, -1), aiText]);
  };

  const handleStreamEnd = (finalText) => {
    if (finalText.includes("__ROLEPLAY_END__")) {
      setShowScore(true);
    }
  };

  const handleSend = (text, scenarioId = currentScenario) => {
    setMessages((prev) => [...prev, text]);
    streamChat({
      text,
      sessionId: "syahmi",
      scenarioId,
      onUserMessage: () => {},
      onStreamUpdate: handleStreamUpdate,
      onStreamEnd: handleStreamEnd,
    });
  };

  const dummyScoreData = [
    {
      session_key: "syahmi_sc2",
      scenario_id: 2,
      goal: "Answer job interview questions",
      target_turn: 8,
      current_turn: 0,
      status: "ongoing",
      summary_sent: 0,
    },
    {
      session_key: "ninda_sc3",
      scenario_id: 3,
      goal: "Check in and board a flight",
      target_turn: 6,
      current_turn: 0,
      status: "ongoing",
      summary_sent: 0,
    },
    {
      session_key: "ninda_sc1",
      scenario_id: 1,
      goal: "Order food and pay the bill",
      target_turn: 6,
      current_turn: 0,
      status: "ongoing",
      summary_sent: 0,
    },
    {
      session_key: "syahmi_sc1",
      scenario_id: 1,
      goal: "Order food and pay the bill",
      target_turn: 6,
      current_turn: 3,
      status: "ongoing",
      summary_sent: 0,
    },
    {
      session_key: "syahmi_sc4",
      scenario_id: 4,
      goal: "Buy an item in a mall",
      target_turn: 6,
      current_turn: 6,
      status: "completed",
      summary_sent: 0,
    },
  ];

  const handleOk = () => {
    // kembali ke main scenario 0
    setCurrentScenario(0);
    setMessages([]);
    setShowScore(false);
  };

  return (
    <div>
      <div>
        <h2>Scenario {currentScenario}</h2>
        {messages.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
        <button onClick={() => handleSend("Hi there!", currentScenario)}>
          Send Dummy
        </button>
      </div>

      {showScore && (
        <div
          style={{
            border: "1px solid #333",
            padding: "16px",
            marginTop: "16px",
            borderRadius: "8px",
            background: "#f0f0f0",
          }}
        >
          <h3>🎯 Roleplay Completed! Session Score</h3>
          <table border="1" cellPadding="6" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>session_key</th>
                <th>scenario_id</th>
                <th>goal</th>
                <th>target_turn</th>
                <th>current_turn</th>
                <th>status</th>
                <th>summary_sent</th>
              </tr>
            </thead>
            <tbody>
              {dummyScoreData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.session_key}</td>
                  <td>{row.scenario_id}</td>
                  <td>{row.goal}</td>
                  <td>{row.target_turn}</td>
                  <td>{row.current_turn}</td>
                  <td
                    style={{
                      color: row.status === "completed" ? "blue" : "green",
                      fontWeight: "bold",
                    }}
                  >
                    {row.status}
                  </td>
                  <td>{row.summary_sent}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              borderRadius: "6px",
              background: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
            onClick={handleOk}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
