import { createListCollection } from "@chakra-ui/react";


export const difficulties = createListCollection({
    items: [
        { label: "Beginner", value: "beginner" },
        { label: "Elementary", value: "elementary" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" },
        { label: "Fluent", value: "fluent" },
    ],
});

export const languages = createListCollection({
    items: [
        { label: "Arabic (Egypt)", value: "ar-EG" },
        { label: "Arabic (Saudi Arabia)", value: "ar-SA" },
        { label: "Chinese (Simplified)", value: "zh-CN" },
        { label: "Chinese (Taiwan)", value: "zh-TW" },
        { label: "Chinese (Hong Kong)", value: "zh-HK" },
        { label: "Danish (Denmark)", value: "da-DK" },
        { label: "Dutch (Netherlands)", value: "nl-NL" },
        { label: "English (US)", value: "en-US" },
        { label: "Finnish (Finland)", value: "fi-FI" },
        { label: "French (France)", value: "fr-FR" },
        { label: "French (Canada)", value: "fr-CA" },
        { label: "German (Germany)", value: "de-DE" },
        { label: "Hindi (India)", value: "hi-IN" },
        { label: "Italian (Italy)", value: "it-IT" },
        { label: "Japanese (Japan)", value: "ja-JP" },
        { label: "Korean (Korea)", value: "ko-KR" },
        { label: "Norwegian (Bokmål, Norway)", value: "nb-NO" },
        { label: "Polish (Poland)", value: "pl-PL" },
        { label: "Portuguese (Brazil)", value: "pt-BR" },
        { label: "Portuguese (Portugal)", value: "pt-PT" },
        { label: "Russian (Russia)", value: "ru-RU" },
        { label: "Spanish (Mexico)", value: "es-MX" },
        { label: "Spanish (Spain)", value: "es-ES" },
        { label: "Swedish (Sweden)", value: "sv-SE" },
        { label: "Turkish (Turkey)", value: "tr-TR" },
        { label: "Vietnamese (Vietnam)", value: "vi-VN" },
    ],
});


