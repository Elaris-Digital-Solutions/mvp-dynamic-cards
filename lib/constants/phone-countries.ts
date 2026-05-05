export type PhoneCountry = {
  name: string
  flag: string
  dialCode: string
  code: string
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { name: 'Perú',                  flag: '🇵🇪', dialCode: '+51',   code: 'PE' },
  { name: 'Argentina',             flag: '🇦🇷', dialCode: '+54',   code: 'AR' },
  { name: 'Bolivia',               flag: '🇧🇴', dialCode: '+591',  code: 'BO' },
  { name: 'Brasil',                flag: '🇧🇷', dialCode: '+55',   code: 'BR' },
  { name: 'Chile',                 flag: '🇨🇱', dialCode: '+56',   code: 'CL' },
  { name: 'Colombia',              flag: '🇨🇴', dialCode: '+57',   code: 'CO' },
  { name: 'Costa Rica',            flag: '🇨🇷', dialCode: '+506',  code: 'CR' },
  { name: 'Cuba',                  flag: '🇨🇺', dialCode: '+53',   code: 'CU' },
  { name: 'Ecuador',               flag: '🇪🇨', dialCode: '+593',  code: 'EC' },
  { name: 'El Salvador',           flag: '🇸🇻', dialCode: '+503',  code: 'SV' },
  { name: 'España',                flag: '🇪🇸', dialCode: '+34',   code: 'ES' },
  { name: 'Estados Unidos',        flag: '🇺🇸', dialCode: '+1',    code: 'US' },
  { name: 'Guatemala',             flag: '🇬🇹', dialCode: '+502',  code: 'GT' },
  { name: 'Honduras',              flag: '🇭🇳', dialCode: '+504',  code: 'HN' },
  { name: 'México',                flag: '🇲🇽', dialCode: '+52',   code: 'MX' },
  { name: 'Nicaragua',             flag: '🇳🇮', dialCode: '+505',  code: 'NI' },
  { name: 'Panamá',                flag: '🇵🇦', dialCode: '+507',  code: 'PA' },
  { name: 'Paraguay',              flag: '🇵🇾', dialCode: '+595',  code: 'PY' },
  { name: 'Puerto Rico',           flag: '🇵🇷', dialCode: '+1787', code: 'PR' },
  { name: 'República Dominicana',  flag: '🇩🇴', dialCode: '+1809', code: 'DO' },
  { name: 'Uruguay',               flag: '🇺🇾', dialCode: '+598',  code: 'UY' },
  { name: 'Venezuela',             flag: '🇻🇪', dialCode: '+58',   code: 'VE' },
]

export const DEFAULT_COUNTRY = PHONE_COUNTRIES[0]
