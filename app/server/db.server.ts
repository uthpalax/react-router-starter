import { PrismaClient } from '@prisma/client'
import { remember } from '@epic-web/remember'


export const prisma = remember('prisma', () => {
  return new PrismaClient()
})
