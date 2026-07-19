import appHandler from './[...path].js';

// Vercel's explicit rewrite forwards every /api/* request here. Restore the
// original Express path before handing the request to the shared API handler.
export default function handler(req, res) {
  const requestUrl = new URL(req.url, 'http://localhost');
  const path = requestUrl.searchParams.get('path');

  if (path) {
    requestUrl.searchParams.delete('path');
    const search = requestUrl.searchParams.toString();
    req.url = `/api/${path}${search ? `?${search}` : ''}`;
  }

  return appHandler(req, res);
}
