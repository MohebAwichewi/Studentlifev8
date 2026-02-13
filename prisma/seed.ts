
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Clean up existing data (optional, be careful in prod)
  // await prisma.ticket.deleteMany()
  // await prisma.deal.deleteMany()
  // await prisma.business.deleteMany()
  // await prisma.user.deleteMany()

  // 2. Create User
  const password = await hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'wajih@win.tn' },
    update: {},
    create: {
      email: 'wajih@win.tn',
      fullName: 'Wajih User',
      password,
      dob: '2000-01-01',
      university: 'Esprit',
      hometown: 'Tunis',
      isVerified: true
    }
  })
  console.log(`👤 Created User: ${user.email}`)

  // 3. Create Businesses (Tunis & Sousse)
  const businesses = [
    {
      email: 'burger@win.tn',
      name: 'Smash Burger Tunis',
      desc: 'The best smash burgers in town. Authentic taste.',
      city: 'Tunis',
      lat: 36.8065,
      lng: 10.1815,
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      logo: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png'
    },
    {
      email: 'coffee@win.tn',
      name: 'Startup Coffee',
      desc: 'Coworking space and premium coffee shop.',
      city: 'Ariana',
      lat: 36.8665,
      lng: 10.1647, // Near Esprit area
      category: 'Coffee',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      logo: 'https://cdn-icons-png.flaticon.com/512/2935/2935413.png'
    },
    {
      email: 'gym@win.tn',
      name: 'Iron Gym Sousse',
      desc: 'Professional equipment for serious production.',
      city: 'Sousse',
      lat: 35.8256,
      lng: 10.6084,
      category: 'Fitness',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      logo: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png'
    }
  ]

  for (const b of businesses) {
    const business = await prisma.business.upsert({
      where: { email: b.email },
      update: {},
      create: {
        email: b.email,
        password, // Same password for testing
        businessName: b.name,
        description: b.desc,
        city: b.city,
        latitude: b.lat,
        longitude: b.lng,
        category: b.category,
        coverImage: b.image,
        logo: b.logo,
        isVerified: true
      }
    })
    console.log(`🏢 Created Business: ${business.businessName}`)

    // 4. Create Deals for each business
    await prisma.deal.createMany({
      data: [
        {
          title: `50% Off First Order at ${b.name}`,
          description: 'Get half price on your first purchase. Valid for new customers only.',
          discount: '50% OFF',
          category: b.category,
          businessId: business.id,
          image: b.image,
          isActive: true
        },
        {
          title: `Buy 1 Get 1 Free - ${b.category} Special`,
          description: 'Bring a friend and enjoy our special offer.',
          discount: 'BOGO',
          category: b.category,
          businessId: business.id,
          image: b.image,
          isActive: true, // Some active
        },
        {
          title: `Student Special - 20% Off`,
          description: 'Show your student ID (or use this app) to get 20% off anytime.',
          discount: '20% OFF',
          category: b.category,
          businessId: business.id,
          image: b.image,
          isActive: true
        }
      ]
    })
    console.log(`  🏷️ Added deals for ${b.name}`)
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })