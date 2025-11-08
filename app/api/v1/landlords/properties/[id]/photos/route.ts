import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { uploadToCloudinary, deleteFromCloudinary, isCloudinaryUrl } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Use Node.js runtime for Buffer support

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify property belongs to landlord
    const property = await prisma.property.findFirst({
      where: {
        id: params.id,
        landlordId: session.user.id,
      },
      select: { id: true, photos: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Check if request is JSON (photo URLs) or FormData (files)
    const contentType = request.headers.get("content-type") || "";
    let uploadedUrls: string[] = [];

    if (contentType.includes("application/json")) {
      // Client already uploaded to Cloudinary, just need to add URLs
      const body = await request.json();
      uploadedUrls = Array.isArray(body.photos) ? body.photos : [];
    } else {
      // Legacy: Upload files directly (for backward compatibility)
      const formData = await request.formData();
      const files = formData.getAll("photos") as File[];

      if (files.length === 0) {
        return NextResponse.json(
          { error: "No photos provided" },
          { status: 400 }
        );
      }

      // Upload all files to Cloudinary in parallel
      const uploadPromises = files
        .filter(file => file.type.startsWith("image/"))
        .map(async (file) => {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const url = await uploadToCloudinary(buffer, "properties");
          return url;
        });

      uploadedUrls = await Promise.all(uploadPromises);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "No photos provided" },
        { status: 400 }
      );
    }

    // Update property with new photos
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        photos: [...(property.photos || []), ...uploadedUrls],
      },
      select: { photos: true },
    });

    return NextResponse.json(
      { 
        message: "Photos uploaded successfully",
        photos: updatedProperty.photos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading photos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const photoUrl = searchParams.get("photoUrl");

    if (!photoUrl) {
      return NextResponse.json(
        { error: "Photo URL is required" },
        { status: 400 }
      );
    }

    // Verify property belongs to landlord
    const property = await prisma.property.findFirst({
      where: {
        id: params.id,
        landlordId: session.user.id,
      },
      select: { id: true, photos: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Remove photo from array
    const updatedPhotos = (property.photos || []).filter((p) => p !== photoUrl);

    // Delete file from Cloudinary if it's a Cloudinary URL
    if (isCloudinaryUrl(photoUrl)) {
      try {
        await deleteFromCloudinary(photoUrl);
      } catch (fileError) {
        console.error("Error deleting file from Cloudinary:", fileError);
        // Continue even if file deletion fails
      }
    }

    // Update property
    await prisma.property.update({
      where: { id: params.id },
      data: {
        photos: updatedPhotos,
      },
    });

    return NextResponse.json(
      { message: "Photo deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

