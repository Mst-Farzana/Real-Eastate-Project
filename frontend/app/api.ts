const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL || 'https://real-eastate-project.onrender.com/api';

const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, '');

export const apiUrl = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;
