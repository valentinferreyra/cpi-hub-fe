export const parseApiDate = (dateString: string): Date => {
  if (!dateString) {
    return new Date();
  }

  try {
    let normalizedDate = dateString;
    
    const microsecondMatch = normalizedDate.match(/\.(\d{7,})/);
    if (microsecondMatch) {
      const microseconds = microsecondMatch[1].substring(0, 6);
      normalizedDate = normalizedDate.replace(/\.\d{7,}/, `.${microseconds}`);
    }
    
    if (normalizedDate.includes('Z')) {
      normalizedDate = normalizedDate.replace('Z', '-03:00');
    } else if (!normalizedDate.includes('Z') && !normalizedDate.includes('+') && !normalizedDate.includes('-', 10)) {
      normalizedDate += '-03:00';
    }
    
    const date = new Date(normalizedDate);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.warn(`Error parsing date: ${dateString}`, error);
    return new Date();
  }
};

export const formatDateTime = (dateString: string): string => {
  const date = parseApiDate(dateString);
  const formatted = date.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires'
  });
  return formatted.replace(/(\d{2}:\d{2})/, '$1 hs');
};

export const formatDateShort = (dateString: string): string => {
  const date = parseApiDate(dateString);
  const formatted = date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires'
  });
  return formatted.replace(/(\d{2}:\d{2})/, '$1 hs');
};
    
export const formatPostDate = (dateString: string): string => {
  return formatDateShort(dateString);
};

export const formatPostDetailDate = (dateString: string): string => {
  const date = parseApiDate(dateString);
  return date.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires'
  });
};

export const formatPostDetailTime = (dateString: string): string => {
  const date = parseApiDate(dateString);
  const formatted = date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires'
  });
  // Agregar "hs" al final de la hora
  return formatted.replace(/(\d{2}:\d{2})/, '$1 hs');
};

export const formatChatTime = (dateString: string): string => {
  return formatPostDetailTime(dateString);
};
