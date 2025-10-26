import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/olts/:path*',
    '/api/onus/:path*',
    '/api/dashboard/:path*',
  ]
}