import requests

LT_URL = "https://languagetool-production-4577.up.railway.app/v2/check"
response = requests.post(
    LT_URL,
    data={"text": "She go to school yesterday.", "language": "en-US"}
)

data = response.json()

# =========================
# 1. GLOBAL INSIGHT (AI PROMPT)
# =========================
language_code = data.get("language", {}).get("code")
confidence = data.get("language", {}).get("detectedLanguage", {}).get("confidence", 0)

matches = data.get("matches", [])
error_count = len(matches)

has_grammar_error = any(m["rule"]["category"]["id"] == "GRAMMAR" for m in matches)

sentence_count = len(data.get("sentenceRanges", []))

# heuristik sederhana "story-like"
is_story_like = sentence_count >= 1 and len(data.get("matches", [])) > 0

insight_output = {
    "language_code": language_code,
    "confidence": round(confidence, 2),
    "error_count": error_count,
    "has_grammar_error": has_grammar_error,
    "sentence_count": sentence_count,
    "is_story_like": is_story_like
}

# =========================
# 2. ERROR DETAIL (KOREKSI KALIMAT)
# =========================
error_outputs = []

original_text = data.get("matches", [{}])[0].get("sentence") if matches else ""

corrected_sentence = original_text

for m in matches:
    rule_id = m.get("rule", {}).get("id")
    issue_type = m.get("rule", {}).get("issueType")

    offset = m.get("offset", 0)
    length = m.get("length", 0)

    wrong_text = m.get("context", {}).get("text", "")[offset:offset + length]

    suggestions = [r["value"] for r in m.get("replacements", [])]

    best_correction = suggestions[-1] if suggestions else wrong_text

    # =========================
    # highlight error di original sentence
    # =========================
    highlighted = original_text[:offset] + f"[[{wrong_text}]]" + original_text[offset + length:]

    # =========================
    # build corrected sentence
    # =========================
    corrected_sentence = corrected_sentence[:offset] + best_correction + corrected_sentence[offset + length:]

    error_outputs.append({
        "rule_id": rule_id,
        "issue_type": issue_type,
        "wrong_text": wrong_text,
        "offset": offset,
        "length": length,
        "suggestions": suggestions,
        "best_correction": best_correction,
        "sentence": original_text
    })

# =========================
# OUTPUT
# =========================
print("=== INSIGHT OUTPUT ===")
print(insight_output)

print("\n=== ERROR OUTPUT ===")
print(error_outputs)

print("\n=== ORIGINAL (HIGHLIGHTED ERROR) ===")
print(highlighted)

print("\n=== CORRECTED SENTENCE ===")
print(corrected_sentence)
