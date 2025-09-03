export interface Country {
    code: string;
    name: string;
    dial_code: string;
    flag: string;
}

export const countries: Country[] = [
    { code: 'TR', name: 'Turkey', dial_code: '+90', flag: '🇹🇷' },
    { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸' },
    { code: 'DE', name: 'Germany', dial_code: '+49', flag: '🇩🇪' },
    { code: 'RU', name: 'Russia', dial_code: '+7', flag: '🇷🇺' },
    { code: 'GB', name: 'United Kingdom', dial_code: '+44', flag: '🇬🇧' },
    { code: 'FR', name: 'France', dial_code: '+33', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', dial_code: '+39', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', dial_code: '+34', flag: '🇪🇸' },
    { code: 'CN', name: 'China', dial_code: '+86', flag: '🇨🇳' },
    { code: 'IN', name: 'India', dial_code: '+91', flag: '🇮🇳' },
    { code: 'JP', name: 'Japan', dial_code: '+81', flag: '🇯🇵' },
    { code: 'BR', name: 'Brazil', dial_code: '+55', flag: '🇧🇷' },
    { code: 'CA', name: 'Canada', dial_code: '+1', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', dial_code: '+61', flag: '🇦🇺' },
    { code: 'NL', name: 'Netherlands', dial_code: '+31', flag: '🇳🇱' },
    { code: 'UA', name: 'Ukraine', dial_code: '+380', flag: '🇺🇦' },
    { code: 'AE', name: 'United Arab Emirates', dial_code: '+971', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦' },
    { code: 'AZ', name: 'Azerbaijan', dial_code: '+994', flag: '🇦🇿' },
    { code: 'KZ', name: 'Kazakhstan', dial_code: '+7', flag: '🇰🇿' },
];
