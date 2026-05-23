          {mode !== "learn" && (
            <ChatSection
              lupaKata={lupaKata}
              chatHistory={chatHistory}
              liveTranscript={liveTranscript}
              bottomRef={bottomRef}
              disabled={allDailyComplete}
              mode={mode}
              data={data}
              toggleFavorite={handleToggleFavorite}
              autoCorrectionRef={autoCorrectionRef}
              speakText={speakText}
            />
          )}

          {((mode === "freeTalk" && freeTalkStarted) ||
            (mode === "dailyStory" && dailyStarted) ||
            (mode === "roleplay" && rolePlayStarted)) && (
            <BottomActions
              isRecording={isRecording}
              showSuggestions={showSuggestions}
              suggestions={suggestions}
              speakText={speakText}
              lupaKata={lupaKata}
              isSpeaking={isSpeaking}
              controlProps={{
                isRecording,
                isSpeaking,
                forceStop,
                micReady,
                speakerReady,
                requestAudioPermission,
                startRecording,
                stopRecording,
                cancelRecording,
                toggleSuggestion,
                isIdle,
                openLupaKata: () =>
                  lupaKata.toggleLupaKata(
                    isRecording,
                    speech.pauseRecording,
                    speech.resumeRecording,
                  ),
                isLupaKataActive: lupaKata.isLupaKataActive,
                lupaKataResult: lupaKata.lupaKataResult,
                isDailyLocked,
              }}
            />
          )}