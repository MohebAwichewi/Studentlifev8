import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch Business Profile
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ success: false, error: "Business ID required" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    // Return safe data
    const { password, ...safeData } = business;
    return NextResponse.json({ success: true, business: safeData });

    // ✅ FIX: Use businessId instead of email (easier for frontend)
    const { businessId } = await req.json()

    const business = await prisma.business.findUnique({
      where: { id: businessId }, // Lookup by ID
      select: {
        id: true,
        businessName: true,
        email: true,
        phone: true,
        category: true,
        description: true,
        logo: true,
        coverImage: true,
        website: true,
        address: true,
        googleMapsUrl: true,
        googleMapEmbed: true // ✅ Added
      }
    })
    return NextResponse.json(business)
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update Business Profile
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { businessId, ...updates } = body;
    const body = await req.json()
    // ✅ FIX: Use businessId to identify who to update
    const { businessId, ...updates } = body

    if (!businessId) {
      return NextResponse.json({ success: false, error: "Business ID required" }, { status: 400 });
    }

    // Validate Business Exists
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    // Update Allowed Fields
    // We whitelist fields to prevent overwriting sensitive data like password/subscription
    const allowedUpdates = {
      businessName: updates.businessName,
      phone: updates.phone,
      address: updates.address,
      city: updates.city,
      description: updates.description,
      logo: updates.logo,
      coverImage: updates.coverImage,
      website: updates.website,
      googleMapsUrl: updates.googleMapsUrl,
      googleMapEmbed: updates.googleMapEmbed,
      openingHours: updates.openingHours
    };

    // Remove undefined keys
    Object.keys(allowedUpdates).forEach(key =>
      (allowedUpdates as any)[key] === undefined && delete (allowedUpdates as any)[key]
    );

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: allowedUpdates
    });

    const { password, ...safeData } = updatedBusiness;
    return NextResponse.json({ success: true, business: safeData, message: "Profile updated successfully" });

      data: {
        businessName: updates.businessName,
        phone: updates.phone,
        description: updates.description,
        logo: updates.logo,
        coverImage: updates.banner || updates.coverImage, // ✅ Map banner to coverImage
        website: updates.website,
        address: updates.address,
        googleMapsUrl: updates.googleMapsUrl,
        googleMapEmbed: updates.googleMapEmbed // ✅ Added
      }
    })
    return NextResponse.json({ success: true, business: updated })
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
