export function toPhoneDigits(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

export function toTenDigitPhone(value: string | null | undefined) {
  const digits = toPhoneDigits(value);

  if (!digits) {
    return "";
  }

  const indiaAwareMatch = digits.match(/(?:91|0)?(\d{10})$/);

  if (indiaAwareMatch) {
    return indiaAwareMatch[1];
  }

  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function formatIndianPhone(value: string | null | undefined) {
  const phone = toTenDigitPhone(value);

  if (!phone || phone.length !== 10) {
    return String(value ?? "").trim();
  }

  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export function isValidIndianPhone(value: string | null | undefined) {
  return toTenDigitPhone(value).length === 10;
}
