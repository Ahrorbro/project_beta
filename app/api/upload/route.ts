import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Use Node.js runtime for Buffer support

/**
 * Unified file upload endpoint
 * Accepts files and uploads them to Cloudinary
 * 
 * Query parameters:
 * - folder: 'maintenance' | 'properties' | 'leases' (default: 'maintenance')
 * 
 * Body:
 * - file: File (single file)
 * - files: File[] (multiple files, use 'files' field name)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get folder from query parameter (default: maintenance)
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "maintenance";

    // Validate folder
    const validFolders = ["maintenance", "properties", "leases"];
    if (!validFolders.includes(folder)) {
      return NextResponse.json(
        { error: `Invalid folder. Must be one of: ${validFolders.join(", ")}` },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    // Check for single file or multiple files
    const file = formData.get("file") as File | null;
    const files = formData.getAll("files") as File[];

    // Determine which files to process
    const filesToUpload: File[] = [];
    if (file) {
      filesToUpload.push(file);
    } else if (files.length > 0) {
      filesToUpload.push(...files);
    } else {
      return NextResponse.json(
        { error: "No file provided. Use 'file' for single upload or 'files' for multiple." },
        { status: 400 }
      );
    }

    // Validate and upload files
    const uploadedUrls: string[] = [];

    for (const uploadFile of filesToUpload) {
      // Validate file type based on folder
      if (folder === "maintenance" || folder === "properties") {
        if (!uploadFile.type.startsWith("image/")) {
          continue; // Skip non-image files
        }
      }

      // Validate file size (max 10MB for leases, 5MB for images)
      const maxSize = folder === "leases" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (uploadFile.size > maxSize) {
        return NextResponse.json(
          { error: `File size must be less than ${maxSize / (1024 * 1024)}MB` },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const bytes = await uploadFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const url = await uploadToCloudinary(buffer, folder);
      uploadedUrls.push(url);
    }

    // Return single URL for single file, array for multiple files
    if (filesToUpload.length === 1) {
      return NextResponse.json({ 
        url: uploadedUrls[0],
        secure_url: uploadedUrls[0] // Alias for consistency
      });
    } else {
      return NextResponse.json({ 
        urls: uploadedUrls,
        secure_urls: uploadedUrls // Alias for consistency
      });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

