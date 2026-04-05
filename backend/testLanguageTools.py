import requests

LT_URL = "https://languagetool-production-4577.up.railway.app/v2/check"

text_input = "i buy a toy boring"

response = requests.post(LT_URL, data={"text": text_input, "language": "en-US"})

data = response.json()

# =========================
# FILTER RULE
# =========================
IGNORE_RULES = {"I_LOWERCASE"}

matches = data.get("matches", [])

filtered_matches = [
    m for m in matches if m.get("rule", {}).get("id") not in IGNORE_RULES
]

# =========================
# 1. GLOBAL INSIGHT
# =========================
language_code = data.get("language", {}).get("code")
confidence = data.get("language", {}).get("detectedLanguage", {}).get("confidence", 0)

error_count = len(filtered_matches)

has_grammar_error = any(
    m.get("rule", {}).get("category", {}).get("id") == "GRAMMAR"
    for m in filtered_matches
)

sentence_count = len(data.get("sentenceRanges", []))

is_story_like = sentence_count >= 1 and error_count > 0

insight_output = {
    "language_code": language_code,
    "confidence": round(confidence, 2),
    "error_count": error_count,
    "has_grammar_error": has_grammar_error,
    "sentence_count": sentence_count,
    "is_story_like": is_story_like,
}

# =========================
# 2. ERROR DETAIL
# =========================
error_outputs = []

original_text = text_input

# =========================
# Highlight ALL errors
# =========================
highlighted_text = original_text

for m in sorted(filtered_matches, key=lambda x: x["offset"], reverse=True):
    offset = m.get("offset", 0)
    length = m.get("length", 0)

    wrong_text = original_text[offset : offset + length]

    highlighted_text = (
        highlighted_text[:offset]
        + f"[[{wrong_text}]]"
        + highlighted_text[offset + length :]
    )

# =========================
# Build corrected sentence
# =========================
corrected_sentence = original_text

for m in sorted(filtered_matches, key=lambda x: x["offset"], reverse=True):
    offset = m.get("offset", 0)
    length = m.get("length", 0)

    suggestions = [r["value"] for r in m.get("replacements", [])]

    best_correction = suggestions[0] if suggestions else ""

    corrected_sentence = (
        corrected_sentence[:offset]
        + best_correction
        + corrected_sentence[offset + length :]
    )

# =========================
# Collect error detail
# =========================
for m in filtered_matches:
    error_outputs.append(
        {
            "rule_id": m.get("rule", {}).get("id"),
            "issue_type": m.get("rule", {}).get("issueType"),
            "wrong_text": original_text[
                m.get("offset", 0) : m.get("offset", 0) + m.get("length", 0)
            ],
            "offset": m.get("offset"),
            "length": m.get("length"),
            "suggestions": [r["value"] for r in m.get("replacements", [])],
            "best_correction": (
                m.get("replacements", [{}])[0].get("value")
                if m.get("replacements")
                else ""
            ),
            "sentence": original_text,
        }
    )

# =========================
# OUTPUT
# =========================
print("=== INSIGHT OUTPUT ===")
print(insight_output)

print("\n=== ERROR OUTPUT ===")
print(error_outputs)

print("\n=== ORIGINAL (HIGHLIGHTED ERROR) ===")
print(highlighted_text)

print("\n=== CORRECTED SENTENCE ===")
print(corrected_sentence)
