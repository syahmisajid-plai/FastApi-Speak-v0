# =========================
# PRICING CONFIG
# =========================

LLM_INPUT_RATE = 0.15 / 1_000_000
LLM_OUTPUT_RATE = 0.60 / 1_000_000
TTS_RATE = 0.000004
# STT_RATE = 1.0 / 1_000_000  # optional


# =========================
# TOKEN ESTIMATION (FAST - PRODUCTION FRIENDLY)
# =========================

def estimate_tokens(text: str) -> int:
    """
    Fast approximation:
    1 token ≈ 4 characters (good enough for monitoring)
    """
    if not text:
        return 0
    return len(text) // 4


# =========================
# LLM COST
# =========================

def calculate_llm_cost(tokens_input, tokens_output):
    return round(
        (tokens_input * LLM_INPUT_RATE) +
        (tokens_output * LLM_OUTPUT_RATE),
        8
    )


# =========================
# TTS COST
# =========================

def calculate_tts_cost(characters):
    return round(characters * TTS_RATE, 8)


# =========================
# STT COST (optional)
# =========================

# def calculate_stt_cost(characters):
#     return round(characters * STT_RATE, 8)


# =========================
# TOTAL COST
# =========================

def calculate_total_cost(llm_cost=0, tts_cost=0, stt_cost=0):
    return round(llm_cost + tts_cost + stt_cost, 8)


# =========================
# MAIN WRAPPER (IMPORTANT)
# =========================

def calculate_all_costs(
    system_prompt="",
    history_messages=None,
    user_input="",
    llm_output="",
    tts_characters=0,
    stt_characters=0
):
    history_messages = history_messages or []

    # -------------------------
    # BUILD INPUT TEXT
    # -------------------------
    history_text = "\n".join([m.content for m in history_messages])

    full_input_text = f"{system_prompt}\n{history_text}\n{user_input}"

    # -------------------------
    # TOKEN ESTIMATION (FAST)
    # -------------------------
    tokens_input = estimate_tokens(full_input_text)
    tokens_output = estimate_tokens(llm_output)

    # -------------------------
    # COST CALCULATION
    # -------------------------
    llm_cost = calculate_llm_cost(tokens_input, tokens_output)
    tts_cost = calculate_tts_cost(tts_characters)
    stt_cost = 0.0

    total_cost = calculate_total_cost(llm_cost, tts_cost, stt_cost)

    return {
        "tokens_input": tokens_input,
        "tokens_output": tokens_output,
        "llm_cost": llm_cost,
        "tts_cost": tts_cost,
        "stt_cost": stt_cost,
        "total_cost": total_cost
    }