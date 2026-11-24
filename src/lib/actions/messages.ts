'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { assertAdmin } from '@/lib/auth/admin'

export async function markAsRead(id: string) {
  await assertAdmin()
  await prisma.message.update({ where: { id }, data: { isRead: true } })
  revalidatePath('/admin/inbox')
}

export async function deleteMessage(id: string) {
  await assertAdmin()
  await prisma.message.delete({ where: { id } })
  revalidatePath('/admin/inbox')
}
