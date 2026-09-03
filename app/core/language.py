"""Language support. English, Roman Urdu, Chinese.

One place defines how each language is described to the model. Adding a
language means adding an entry here — nothing else changes.
"""

DEFAULT_LANGUAGE = "en"

LANGUAGES = {
    "en": "English",
    "ur": "Roman Urdu",
    "ur-script": "Urdu (Arabic script)",
    "zh": "Simplified Chinese",
}

_INSTRUCTIONS = {
    "en": "Respond in clear, plain English.",

    "ur": (
        "Respond entirely in Roman Urdu — Urdu written in Latin script, NOT "
        "Arabic script. Example: 'Do candidates shortlist ho gaye hain, "
        "interview slots book kar diye hain.'\n"
        "Keep technical terms, job titles, and proper nouns in English — that "
        "is how people actually write. Never translate 'job description', "
        "'SQL', 'shortlist' or similar into Urdu words."
    ),

    "ur-script": (
        "Respond entirely in Urdu using Arabic script. Keep technical terms, "
        "job titles, and proper nouns in English."
    ),

    "zh": (
        "Respond entirely in Simplified Chinese (简体中文). Keep technical "
        "terms, job titles, and proper nouns in English where that is the "
        "common industry usage."
    ),
}


def language_instruction(code: str | None) -> str:
    """The line appended to every agent's system prompt."""
    code = (code or DEFAULT_LANGUAGE).strip().lower()
    if code not in _INSTRUCTIONS or code == DEFAULT_LANGUAGE:
        return ""
    return f"\n\nLANGUAGE:\n{_INSTRUCTIONS[code]}"


def language_name(code: str | None) -> str:
    return LANGUAGES.get((code or DEFAULT_LANGUAGE).strip().lower(), "English")