'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Unauthorized')
}

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
