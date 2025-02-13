import bcrypt from 'bcryptjs'
import { type Password, type User } from '@prisma/client'
import { prisma } from './db.server'
import { redirect } from 'react-router'
import { authSessionStorage } from './session.server'

export const sessionKey = 'sessionId'
export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME)


export async function getUserId(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const sessionId = authSession.get(sessionKey)
  if (!sessionId) return null
  const session = await prisma.session.findUnique({
    select: { user: { select: { id: true } } },
    where: { id: sessionId, expirationDate: { gt: new Date() } },
  })
  if (!session?.user) {
    throw redirect('/', {
      headers: {
        'set-cookie': await authSessionStorage.destroySession(authSession),
      },
    })
  }
  return session.user.id
}

export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request)
  if (userId) {
    throw redirect('/')
  }
}

export async function login({
  email,
  password,
}: {
  email: User['email']
  password: string
}) {
  const user = await verifyUserPassword({ email }, password)
  if (!user) return null
  const session = await prisma.session.create({
    select: { id: true, expirationDate: true, userId: true },
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    },
  })
  return session
}

export async function signup({
  email,
  username,
  password,
}: {
  email: User['email']
  username: User['username']
  password: string
}) {
  const hashedPassword = await getPasswordHash(password)

  const session = await prisma.session.create({
    data: {
      expirationDate: getSessionExpirationDate(),
      user: {
        create: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password: {
            create: {
              hash: hashedPassword,
            },
          },
        },
      },
    },
    select: { id: true, userId: true, expirationDate: true },
  })

  return session
}


export async function logout(
  {
    request,
    redirectTo = '/',
  }: {
    request: Request
    redirectTo?: string
  },
  responseInit?: ResponseInit,
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const sessionId = authSession.get(sessionKey)
  // if this fails, we still need to delete the session from the user's browser
  // and it doesn't do any harm staying in the db anyway.
  if (sessionId) {
    // the .catch is important because that's what triggers the query.
    // learn more about PrismaPromise: https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismapromise-behavior
    void prisma.session.deleteMany({ where: { id: sessionId } }).catch(() => { })
  }
  throw redirect(redirectTo, {
    ...responseInit,
    headers: combineHeaders(
      { 'set-cookie': await authSessionStorage.destroySession(authSession) },
      responseInit?.headers,
    ),
  })
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10)
  return hash
}

export async function verifyUserPassword(
  where: Pick<User, 'email'> | Pick<User, 'id'>,
  password: Password['hash'],
) {
  const userWithPassword = await prisma.user.findUnique({
    where,
    select: { id: true, password: { select: { hash: true } } },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  return { id: userWithPassword.id }
}

/**
 * Combine multiple header objects into one (uses append so headers are not overridden)
 */
export function combineHeaders(
  ...headers: Array<ResponseInit['headers'] | null | undefined>
) {
  const combined = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value)
    }
  }
  return combined
}

