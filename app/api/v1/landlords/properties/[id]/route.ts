import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updatePropertySchema = z.object({
  address: z.string().min(1).optional(),
  location: z.string().optional(),
  propertyType: z.enum(["single", "multi"]).optional(),
  description: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updatePropertySchema.parse(body);

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        ...(validated.address !== undefined && { address: validated.address }),
        ...(validated.location !== undefined && { location: validated.location || null }),
        ...(validated.propertyType !== undefined && { propertyType: validated.propertyType }),
        ...(validated.description !== undefined && { description: validated.description || null }),
      },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE_PROPERTY",
      entityType: "Property",
      entityId: params.id,
      details: {
        address: updatedProperty.address,
        location: updatedProperty.location,
        propertyType: updatedProperty.propertyType,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(
      { message: "Property updated successfully", property: updatedProperty },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "LANDLORD" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    // Verify property belongs to landlord (or super admin can delete any)
    const property = await prisma.property.findFirst({
      where: {
        id: params.id,
        ...(isSuperAdmin ? {} : { landlordId: session.user.id }),
      },
      include: {
        units: {
          include: {
            tenants: {
              include: {
                tenant: true,
              },
            },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Check if property has units with tenants
    const occupiedUnits = property.units.filter(
      (unit) => unit.tenants && unit.tenants.length > 0
    );

    // Only allow deletion with tenants if super admin
    if (occupiedUnits.length > 0 && !isSuperAdmin) {
      const unitNumbers = occupiedUnits.map((u) => u.unitNumber).join(", ");
      
      return NextResponse.json(
        { 
          error: `Cannot delete property. The following units have tenants assigned: ${unitNumbers}. Please remove all tenants first.` 
        },
        { status: 400 }
      );
    }

    // Delete all related data first to avoid foreign key constraints
    const unitIds = property.units.map(u => u.id);
    
    if (unitIds.length > 0) {
      // Get all tenant IDs before deleting relationships (for super admin deletion)
      const tenantIds: string[] = [];
      if (isSuperAdmin) {
        property.units.forEach(unit => {
          unit.tenants.forEach(ut => {
            if (ut.tenant && !tenantIds.includes(ut.tenant.id)) {
              tenantIds.push(ut.tenant.id);
            }
          });
        });
      }

      // Delete payments
      await prisma.payment.deleteMany({
        where: { unitId: { in: unitIds } },
      });

      // Delete maintenance requests
      await prisma.maintenanceRequest.deleteMany({
        where: { unitId: { in: unitIds } },
      });

      // Delete lease agreements
      await prisma.leaseAgreement.deleteMany({
        where: { unitId: { in: unitIds } },
      });

      // Delete unit-tenant relationships
      await prisma.unitTenant.deleteMany({
        where: { unitId: { in: unitIds } },
      });

      // Delete units
      await prisma.unit.deleteMany({
        where: { propertyId: params.id },
      });

      // If super admin, also delete tenant user accounts
      if (isSuperAdmin && tenantIds.length > 0) {
        // Delete tenant payments (if any exist outside of units)
        await prisma.payment.deleteMany({
          where: { tenantId: { in: tenantIds } },
        });

        // Delete tenant maintenance requests (if any exist outside of units)
        await prisma.maintenanceRequest.deleteMany({
          where: { tenantId: { in: tenantIds } },
        });

        // Delete tenant lease agreements (if any exist outside of units)
        await prisma.leaseAgreement.deleteMany({
          where: { tenantId: { in: tenantIds } },
        });

        // Delete tenant user accounts
        await prisma.user.deleteMany({
          where: { 
            id: { in: tenantIds },
            role: "TENANT",
          },
        });
      }
    }

    // Delete property
    await prisma.property.delete({
      where: { id: params.id },
    });

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "DELETE_PROPERTY",
      entityType: "Property",
      entityId: params.id,
      details: { 
        address: property.address,
        deletedBySuperAdmin: isSuperAdmin,
        deletedTenants: isSuperAdmin && occupiedUnits.length > 0 ? occupiedUnits.length : 0,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(
      { 
        message: "Property deleted successfully",
        deletedTenants: isSuperAdmin && occupiedUnits.length > 0 ? occupiedUnits.length : 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting property:", error);
    
    // Provide more specific error messages
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete property due to existing relationships. Please contact support." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

