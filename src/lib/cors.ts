import { type NextRequest, NextResponse } from "next/server";

export function addCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3050',
    'https://www.purifytext.com',
    'https://purifytext.com'
  ];

  if (origin && (allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://'))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', 'https://www.purifytext.com');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

export function handleCorsPreflight(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(response, request);
  }
  return null;
}
