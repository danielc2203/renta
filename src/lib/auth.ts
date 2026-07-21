import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import fs from 'fs'

const SECRET_FILE = './jwt_secret.txt'

export function getJwtSecret(): string {
  if (process.env.JWT_SECRET_KEY) {
    return process.env.JWT_SECRET_KEY
  }
  if (fs.existsSync(SECRET_FILE)) {
    return fs.readFileSync(SECRET_FILE, 'utf-8').trim()
  }
  console.warn("Generating ephemeral secret. Instance-isolated!")
  const secret = crypto.randomBytes(32).toString('hex')
  fs.writeFileSync(SECRET_FILE, secret)
  return secret
}

export function signToken(payload: any, expiresIn: string = '8h') {
  return jwt.sign(payload, getJwtSecret(), { expiresIn })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret())
  } catch (e) {
    return null
  }
}

export function setAuthCookie(token: string) {
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })
}

export function clearAuthCookie() {
  cookies().delete('auth_token')
}
