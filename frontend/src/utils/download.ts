export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getFileNameFromDisposition = (disposition: string | undefined, fallback: string) => {
  if (!disposition) return fallback;

  const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1].replace(/^"|"$/g, ''));
    } catch {
      return encodedMatch[1].replace(/^"|"$/g, '') || fallback;
    }
  }

  const quotedMatch = disposition.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) return quotedMatch[1];

  const plainMatch = disposition.match(/filename=([^;]+)/i);
  return plainMatch?.[1]?.replace(/^"|"$/g, '').trim() || fallback;
};

const reportFileStems: Record<string, string> = {
  ru: 'отчет_трудоустройство_выпускников',
  en: 'graduate_employment_report',
  kg: 'бүтүрүүчүлөр_жумушка_орношуу_отчету',
};

export const getReportFallbackFileName = (language: string, extension: string) => {
  const stem = reportFileStems[language] || reportFileStems.ru;
  return `${stem}.${extension}`;
};
