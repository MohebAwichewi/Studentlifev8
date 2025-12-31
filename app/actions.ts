'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --- ADM-01 & ADM-02: Manage Businesses ---
export async function getBusinesses() {
  return await prisma.business.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function updateBusinessStatus(id: string | number, status: string) {
  const businessId = Number(id)
  await prisma.business.update({
    where: { id: businessId },
    data: { status }
  })
  revalidatePath('/admin/dashboard')
}

export async function updateBusinessPlan(id: string | number, plan: string) {
  const businessId = Number(id)
  await prisma.business.update({
    where: { id: businessId },
    data: { plan }
  })
  revalidatePath('/admin/dashboard')
}

// --- ADM-03 & NOT-01, NOT-02, NOT-03: Advanced Push System ---

export async function getPushRequests() {
  return await prisma.pushRequest.findMany({
    include: { business: true },
    orderBy: { createdAt: 'desc' }
  })
}

// 🔒 NOT-02: Rate Limiting Check (Helper Function)
async function checkRateLimit(businessId: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const count = await prisma.pushRequest.count({
    where: {
      businessId,
      status: 'APPROVED',
      sentAt: { gte: today } // Count only approved pushes sent today
    }
  })

  return count; // Returns number of pushes sent today
}

export async function updatePushStatus(id: string | number, status: string) {
  const requestId = Number(id)

  // 1. If Approving, check Rate Limit first (NOT-02)
  if (status === 'APPROVED') {
    const request = await prisma.pushRequest.findUnique({ where: { id: requestId } })
    if (request) {
      const dailyCount = await checkRateLimit(request.businessId)
      
      // RULE: Max 3 pushes per day per business
      if (dailyCount >= 3) {
        console.warn(`⚠️ Business ${request.businessId} exceeded daily limit.`)
      }
    }
  }

  // 2. Update Status and Log Timestamp (NOT-03)
  await prisma.pushRequest.update({
    where: { id: requestId },
    data: { 
      status,
      // If approved, set sentAt. If rejected, clear it.
      sentAt: status === 'APPROVED' ? new Date() : null 
    }
  })
  
  revalidatePath('/admin/dashboard')
}

// --- ADM-04: Universities ---
export async function getUniversities() {
  return await prisma.university.findMany({ orderBy: { name: 'asc' } })
}

export async function addUniversity(formData: FormData) {
  const name = formData.get('name') as string
  const region = formData.get('region') as string

  await prisma.university.create({
    data: {
      name,
      region: region || "Tunis",
      latitude: 36.8065,
      longitude: 10.1815
    }
  })
  revalidatePath('/admin/universities')
}

export async function deleteUniversity(id: number) {
  await prisma.university.delete({ where: { id } })
  revalidatePath('/admin/universities')
}

// --- BUSINESS PORTAL ACTIONS (BP-04, BP-05, BP-07) ---

// ✅ BP-04 & BP-05: Create Discounts with Validity
export async function createDiscount(formData: FormData, businessId: number) {
  const title = formData.get('title') as string;
  const expiry = formData.get('expiry') as string; // BP-05: End dates

  await prisma.deal.create({
    data: {
      title,
      description: formData.get('description') as string,
      category: "Promotion",
      expiry: expiry, 
      businessId: businessId,
    }
  });
  revalidatePath('/business/dashboard');
}

// ✅ BP-07: Start 3-Month Free Trial
export async function startTrial(businessId: number) {
  const trialEndDate = new Date();
  trialEndDate.setMonth(trialEndDate.getMonth() + 3);

  await prisma.business.update({
    where: { id: businessId },
    data: {
      plan: 'PRO_TRIAL',
      trialEnds: trialEndDate
    }
  });
  revalidatePath('/business/dashboard');
}

// ✅ BP-03: Manage Physical Locations
export async function addLocation(formData: FormData, businessId: number) {
  await prisma.location.create({
    data: {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      lat: parseFloat(formData.get('lat') as string) || 36.8065,
      lng: parseFloat(formData.get('lng') as string) || 10.1815,
      businessId
    }
  });
  revalidatePath('/business/dashboard');
}

// ✅ BP-16: Contact Support via Portal
export async function createSupportTicket(formData: FormData, businessId: number) {
  await prisma.ticket.create({
    data: {
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      businessId
    }
  });
  revalidatePath('/business/dashboard');
}

// ✅ BP-11: Enforcement Logic (Used in Dashboard)
export async function checkSubscriptionActive(businessId: number) {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business || !business.trialEnds) return false;
  return new Date() < new Date(business.trialEnds);
}