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

export const formatPostDate = (dateString: string): string => {
  const date = parseApiDate(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
    
export const formatPostDetailDate = (dateString: string): string => {
  const date = parseApiDate(dateString);
  return date.toLocaleDateString('es-ES');
};

export const formatPostDetailTime = (dateString: string): string => {
  const date = parseApiDate(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
