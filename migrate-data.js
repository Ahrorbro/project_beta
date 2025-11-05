// Migration script to copy data from local database to Prisma Accelerate
// Run with: node migrate-data.js

require('dotenv').config({ path: '.env.local' });
const { PrismaClient: PrismaClientLocal } = require('@prisma/client');
const { PrismaClient: PrismaClientCloud } = require('@prisma/client/edge');
const { withAccelerate } = require('@prisma/extension-accelerate');

// Local database connection (postgresql://localhost)
const localPrisma = new PrismaClientLocal({
  datasources: {
    db: {
      url: process.env.LOCAL_DATABASE_URL || "postgresql://a1234@localhost:5432/rentify?schema=public"
    }
  }
});

// Cloud database connection (Prisma Accelerate)
const cloudPrisma = new PrismaClientCloud({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
}).$extends(withAccelerate());

async function migrateData() {
  console.log('🚀 Starting data migration...\n');

  try {
    // 1. Migrate Users
    console.log('📦 Migrating Users...');
    const users = await localPrisma.user.findMany();
    console.log(`   Found ${users.length} users in local database`);
    
    for (const user of users) {
      try {
        await cloudPrisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            password: user.password,
            role: user.role,
            phone: user.phone,
            profileImage: user.profileImage,
            landlordProfileComplete: user.landlordProfileComplete,
            tenantProfileComplete: user.tenantProfileComplete,
            createdAtBy: user.createdAtBy,
          },
          create: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            role: user.role,
            phone: user.phone,
            profileImage: user.profileImage,
            landlordProfileComplete: user.landlordProfileComplete,
            tenantProfileComplete: user.tenantProfileComplete,
            createdAtBy: user.createdBy,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
        console.log(`   ✅ Migrated: ${user.email} (${user.role})`);
      } catch (error) {
        console.error(`   ❌ Error migrating ${user.email}:`, error.message);
      }
    }

    // 2. Migrate Properties
    console.log('\n📦 Migrating Properties...');
    const properties = await localPrisma.property.findMany();
    console.log(`   Found ${properties.length} properties`);
    
    for (const property of properties) {
      try {
        await cloudPrisma.property.upsert({
          where: { id: property.id },
          update: {
            address: property.address,
            propertyType: property.propertyType,
            description: property.description,
            landlordId: property.landlordId,
          },
          create: {
            id: property.id,
            address: property.address,
            propertyType: property.propertyType,
            description: property.description,
            landlordId: property.landlordId,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt,
          },
        });
        console.log(`   ✅ Migrated property: ${property.address}`);
      } catch (error) {
        console.error(`   ❌ Error migrating property ${property.id}:`, error.message);
      }
    }

    // 3. Migrate Units
    console.log('\n📦 Migrating Units...');
    const units = await localPrisma.unit.findMany();
    console.log(`   Found ${units.length} units`);
    
    for (const unit of units) {
      try {
        await cloudPrisma.unit.upsert({
          where: { id: unit.id },
          update: {
            propertyId: unit.propertyId,
            unitNumber: unit.unitNumber,
            floor: unit.floor,
            rentAmount: unit.rentAmount,
            leaseStartDate: unit.leaseStartDate,
            leaseEndDate: unit.leaseEndDate,
            invitationToken: unit.invitationToken,
            isOccupied: unit.isOccupied,
          },
          create: {
            id: unit.id,
            propertyId: unit.propertyId,
            unitNumber: unit.unitNumber,
            floor: unit.floor,
            rentAmount: unit.rentAmount,
            leaseStartDate: unit.leaseStartDate,
            leaseEndDate: unit.leaseEndDate,
            invitationToken: unit.invitationToken,
            isOccupied: unit.isOccupied,
            createdAt: unit.createdAt,
            updatedAt: unit.updatedAt,
          },
        });
        console.log(`   ✅ Migrated unit: ${unit.unitNumber}`);
      } catch (error) {
        console.error(`   ❌ Error migrating unit ${unit.id}:`, error.message);
      }
    }

    // 4. Migrate UnitTenant relationships
    console.log('\n📦 Migrating UnitTenant relationships...');
    const unitTenants = await localPrisma.unitTenant.findMany();
    console.log(`   Found ${unitTenants.length} unit-tenant relationships`);
    
    for (const ut of unitTenants) {
      try {
        await cloudPrisma.unitTenant.upsert({
          where: { id: ut.id },
          update: {
            unitId: ut.unitId,
            tenantId: ut.tenantId,
          },
          create: {
            id: ut.id,
            unitId: ut.unitId,
            tenantId: ut.tenantId,
            createdAt: ut.createdAt,
            updatedAt: ut.updatedAt,
          },
        });
        console.log(`   ✅ Migrated relationship: Unit ${ut.unitId} ↔ Tenant ${ut.tenantId}`);
      } catch (error) {
        console.error(`   ❌ Error migrating relationship ${ut.id}:`, error.message);
      }
    }

    // 5. Migrate Payments
    console.log('\n📦 Migrating Payments...');
    const payments = await localPrisma.payment.findMany();
    console.log(`   Found ${payments.length} payments`);
    
    for (const payment of payments) {
      try {
        await cloudPrisma.payment.upsert({
          where: { id: payment.id },
          update: {
            unitId: payment.unitId,
            tenantId: payment.tenantId,
            amount: payment.amount,
            dueDate: payment.dueDate,
            paidDate: payment.paidDate,
            status: payment.status,
            editedAt: payment.editedAt,
            transactionId: payment.transactionId,
            selcomReference: payment.selcomReference,
            selcomResultCode: payment.selcomResultCode,
            transactionStatus: payment.transactionStatus,
            receiptUrl: payment.receiptUrl,
          },
          create: {
            id: payment.id,
            unitId: payment.unitId,
            tenantId: payment.tenantId,
            amount: payment.amount,
            dueDate: payment.dueDate,
            paidDate: payment.paidDate,
            status: payment.status,
            editedAt: payment.editedAt,
            transactionId: payment.transactionId,
            selcomReference: payment.selcomReference,
            selcomResultCode: payment.selcomResultCode,
            transactionStatus: payment.transactionStatus,
            receiptUrl: payment.receiptUrl,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
          },
        });
        console.log(`   ✅ Migrated payment: ${payment.id}`);
      } catch (error) {
        console.error(`   ❌ Error migrating payment ${payment.id}:`, error.message);
      }
    }

    // 6. Migrate Maintenance Requests
    console.log('\n📦 Migrating Maintenance Requests...');
    const maintenanceRequests = await localPrisma.maintenanceRequest.findMany();
    console.log(`   Found ${maintenanceRequests.length} maintenance requests`);
    
    for (const mr of maintenanceRequests) {
      try {
        await cloudPrisma.maintenanceRequest.upsert({
          where: { id: mr.id },
          update: {
            unitId: mr.unitId,
            tenantId: mr.tenantId,
            title: mr.title,
            description: mr.description,
            photos: mr.photos,
            status: mr.status,
            resolutionNotes: mr.resolutionNotes,
            resolutionPhotos: mr.resolutionPhotos,
            resolvedAt: mr.resolvedAt,
          },
          create: {
            id: mr.id,
            unitId: mr.unitId,
            tenantId: mr.tenantId,
            title: mr.title,
            description: mr.description,
            photos: mr.photos,
            status: mr.status,
            resolutionNotes: mr.resolutionNotes,
            resolutionPhotos: mr.resolutionPhotos,
            resolvedAt: mr.resolvedAt,
            createdAt: mr.createdAt,
            updatedAt: mr.updatedAt,
          },
        });
        console.log(`   ✅ Migrated maintenance request: ${mr.title}`);
      } catch (error) {
        console.error(`   ❌ Error migrating maintenance request ${mr.id}:`, error.message);
      }
    }

    // 7. Migrate Lease Agreements
    console.log('\n📦 Migrating Lease Agreements...');
    const leases = await localPrisma.leaseAgreement.findMany();
    console.log(`   Found ${leases.length} lease agreements`);
    
    for (const lease of leases) {
      try {
        await cloudPrisma.leaseAgreement.upsert({
          where: { id: lease.id },
          update: {
            unitId: lease.unitId,
            tenantId: lease.tenantId,
            documentUrl: lease.documentUrl,
            startDate: lease.startDate,
            endDate: lease.endDate,
          },
          create: {
            id: lease.id,
            unitId: lease.unitId,
            tenantId: lease.tenantId,
            documentUrl: lease.documentUrl,
            startDate: lease.startDate,
            endDate: lease.endDate,
            createdAt: lease.createdAt,
            updatedAt: lease.updatedAt,
          },
        });
        console.log(`   ✅ Migrated lease agreement: ${lease.id}`);
      } catch (error) {
        console.error(`   ❌ Error migrating lease agreement ${lease.id}:`, error.message);
      }
    }

    // 8. Migrate Subscriptions
    console.log('\n📦 Migrating Subscriptions...');
    const subscriptions = await localPrisma.subscription.findMany();
    console.log(`   Found ${subscriptions.length} subscriptions`);
    
    for (const sub of subscriptions) {
      try {
        await cloudPrisma.subscription.upsert({
          where: { id: sub.id },
          update: {
            userId: sub.userId,
            plan: sub.plan,
            status: sub.status,
            trialStartDate: sub.trialStartDate,
            trialEndDate: sub.trialEndDate,
            billingCycleStart: sub.billingCycleStart,
            billingCycleEnd: sub.billingCycleEnd,
            nextBillingDate: sub.nextBillingDate,
            membershipPaid: sub.membershipPaid,
            membershipPaymentDate: sub.membershipPaymentDate,
            membershipAmount: sub.membershipAmount,
          },
          create: {
            id: sub.id,
            userId: sub.userId,
            plan: sub.plan,
            status: sub.status,
            trialStartDate: sub.trialStartDate,
            trialEndDate: sub.trialEndDate,
            billingCycleStart: sub.billingCycleStart,
            billingCycleEnd: sub.billingCycleEnd,
            nextBillingDate: sub.nextBillingDate,
            membershipPaid: sub.membershipPaid,
            membershipPaymentDate: sub.membershipPaymentDate,
            membershipAmount: sub.membershipAmount,
            createdAt: sub.createdAt,
            updatedAt: sub.updatedAt,
          },
        });
        console.log(`   ✅ Migrated subscription: ${sub.id}`);
      } catch (error) {
        console.error(`   ❌ Error migrating subscription ${sub.id}:`, error.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    const cloudUsers = await cloudPrisma.user.count();
    const cloudProperties = await cloudPrisma.property.count();
    const cloudUnits = await cloudPrisma.unit.count();
    console.log(`   Users: ${cloudUsers}`);
    console.log(`   Properties: ${cloudProperties}`);
    console.log(`   Units: ${cloudUnits}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await localPrisma.$disconnect();
    await cloudPrisma.$disconnect();
  }
}

migrateData();

