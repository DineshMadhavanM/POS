/**
 * Safely extracts a displayable string error message from any error type
 * Prevents React child rendering errors when errors are objects like { code, message }
 */
export const getErrorMessage = (err: any, fallback: string = 'An unexpected error occurred. Please try again.'): string => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  // Axios response payload
  const resp = err?.response?.data;
  if (resp) {
    if (typeof resp.error === 'string') return resp.error;
    if (resp.error && typeof resp.error === 'object') {
      if (typeof resp.error.message === 'string') return resp.error.message;
      return JSON.stringify(resp.error);
    }
    if (typeof resp.message === 'string') return resp.message;
  }

  // JS Error or Supabase / OAuth error object { code, message }
  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  if (typeof err === 'object') {
    if (typeof err.error_description === 'string') return err.error_description;
    if (typeof err.msg === 'string') return err.msg;
    try {
      const serialized = JSON.stringify(err);
      return serialized !== '{}' ? serialized : fallback;
    } catch {
      return fallback;
    }
  }

  return String(err || fallback);
};
