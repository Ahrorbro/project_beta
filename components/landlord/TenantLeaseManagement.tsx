"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FileText, Upload, Calendar, X } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import type { User, LeaseAgreement, Unit } from "@prisma/client";

interface TenantLeaseManagementProps {
  tenant: User & {
    tenantUnits: Array<{
      id: string;
      unit: Unit;
    }>;
    leaseAgreements: LeaseAgreement[];
  };
}

export function TenantLeaseManagement({ tenant }: TenantLeaseManagementProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLease, setEditingLease] = useState<LeaseAgreement | null>(null);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("unitId", tenant.tenantUnits[0]?.unit.id || "");
      formData.append("tenantId", tenant.id);

      const response = await fetch("/api/v1/landlords/leases/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload lease");
      }

      toast.success("Lease agreement uploaded successfully!");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to upload lease agreement");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditLease = (lease: LeaseAgreement) => {
    setEditingLease(lease);
    setFormData({
      startDate: formatDate(lease.startDate).split("/").reverse().join("-"),
      endDate: formatDate(lease.endDate).split("/").reverse().join("-"),
    });
    setIsEditing(true);
  };

  const handleUpdateLease = async () => {
    if (!editingLease) return;

    try {
      const response = await fetch(`/api/v1/landlords/leases/${editingLease.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update lease");
      }

      toast.success("Lease updated successfully!");
      setIsEditing(false);
      setEditingLease(null);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update lease");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Lease Management</h2>
        <label className="glass-button cursor-pointer inline-flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {isUploading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Uploading...
            </span>
          ) : (
            "Upload Lease"
          )}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {tenant.leaseAgreements.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto mb-4 text-white/40" />
          <p className="text-white/60 mb-4">No lease agreements uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tenant.leaseAgreements.map((lease) => (
            <div
              key={lease.id}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              {isEditing && editingLease?.id === lease.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <GlassInput
                      label="Start Date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                    <GlassInput
                      label="End Date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <GlassButton
                      variant="primary"
                      size="sm"
                      onClick={handleUpdateLease}
                    >
                      Save
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditingLease(null);
                      }}
                    >
                      Cancel
                    </GlassButton>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="font-semibold text-white">
                        Lease Agreement
                      </p>
                      <p className="text-sm text-white/60">
                        {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={lease.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-button text-sm"
                    >
                      View Document
                    </a>
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditLease(lease)}
                    >
                      Edit Dates
                    </GlassButton>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

