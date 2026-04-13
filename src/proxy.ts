import { type NextRequest, type NextResponse } from 'next/server';

export function proxy(request: NextRequest): NextResponse | undefined {
  const response = NextResponse.next();

  // Allow preview iframe to load resources
  const origin = request.headers.get('origin') || '';
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Add frame-ancestors to allow embedding in preview
  response.headers.set('Content-Security-Policy', 'frame-ancestors *');

  return response;
}

export const config = {
  matcher: [],
};
