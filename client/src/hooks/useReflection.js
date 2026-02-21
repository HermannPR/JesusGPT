import { useState } from 'react';

export function useReflection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReflection = async ({ question, language, mode }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language, mode }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch reflection');
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchReflection };
}
