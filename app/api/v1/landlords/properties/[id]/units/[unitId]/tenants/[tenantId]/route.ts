import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismaQuery as prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
    unitId: string;
    tenantId: string;
  };
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

    // Verify unit belongs to landlord's property
    const unit = await prisma.unit.findFirst({
      where: {
        id: params.unitId,
        property: {
          id: params.id,
          landlordId: session.user.id,
        },
      },
      include: {
        property: true,
        tenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    // Find the UnitTenant relationship
    const unitTenant = await prisma.unitTenant.findFirst({
      where: {
        unitId: params.unitId,
        tenantId: params.tenantId,
      },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!unitTenant) {
      return NextResponse.json(
        { error: "Tenant not assigned to this unit" },
        { status: 404 }
      );
    }

    // Delete the UnitTenant relationship (this will cascade delete related data if configured)
    await prisma.unitTenant.delete({
      where: { id: unitTenant.id },
    });

    // Update unit occupancy status if no tenants remain
    const remainingTenants = await prisma.unitTenant.count({
      where: { unitId: params.unitId },
    });

    if (remainingTenants === 0) {
      await prisma.unit.update({
        where: { id: params.unitId },
        data: { isOccupied: false },
      });
    }

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: "REMOVE_TENANT_FROM_UNIT",
      entityType: "UnitTenant",
      entityId: unitTenant.id,
      details: {
        tenantId: params.tenantId,
        tenantEmail: unitTenant.tenant.email,
        unitId: params.unitId,
        unitNumber: unit.unitNumber,
        propertyAddress: unit.property.address,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(
      { message: "Tenant removed from unit successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing tenant from unit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

