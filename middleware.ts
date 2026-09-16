import { NextResponse, type NextRequest } from 'next/server'

/**
 * Makes the requested path readable from the root layout.
 *
 * A layout is not told which page it is rendering, and the visit log needs the
 * path. Middleware is the supported way to pass that down. It runs on the edge
 * runtime where Prisma cannot, so nothing is written here — this only forwards
 * a header, and the layout does the recording after the response is sent.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers)
  headers.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  // Everything a person can land on. Assets, API routes and the image
  // optimiser are not page views and would drown the log.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
