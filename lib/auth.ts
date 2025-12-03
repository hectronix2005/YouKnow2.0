import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string
                    }
                })

                if (!user) {
                    return null
                }

                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!passwordMatch) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                }
            }
        })
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const path = nextUrl.pathname

            // Public routes - always allow
            const isPublicRoute = path === "/" ||
                                  path.startsWith("/login") ||
                                  path.startsWith("/register") ||
                                  path.startsWith("/courses") ||
                                  path.startsWith("/checklist")

            if (isPublicRoute) {
                return true
            }

            // Protected routes - require login
            const isProtectedRoute = path.startsWith("/dashboard") ||
                                     path.startsWith("/lider") ||
                                     path.startsWith("/creador") ||
                                     path.startsWith("/admin")

            if (isProtectedRoute && !isLoggedIn) {
                return false
            }

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id || token.sub) as string
                session.user.role = token.role as string
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt"
    }
})
