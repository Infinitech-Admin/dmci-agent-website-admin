"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import DeleteConfirmationModal from "@/app/components/modal/deletemodal";
import AppointmentDetailModal from "@/app/components/modal/AppointmentDetailModal";
import { getAuthHeaders } from "@/app/utility/auth";
import { LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chip } from "@heroui/react";
import { GoDotFill } from "react-icons/go";
import DashboardCardData from "@/app/components/dashboardCarddata";

type Appointment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  properties: string;
  status: "Pending" | "Accepted" | "Rejected" | "Other";
};

const DashboardAppointmentTable: React.FC = () => {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null,
  );
  const [deleteBtnLoading, setDeleteBtnLoading] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const fetcherWithAuth = async (url: string) => {
    const headers = getAuthHeaders();
    const res = await fetch(url, { method: "GET", headers });

    if (res.status === 401) {
      router.replace("/auth/login");
      return;
    }
    if (res.status === 429) {
      toast.error("Too many requests. Please try again later.");
      return;
    }
    return await res.json();
  };

  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/appointments`,
    fetcherWithAuth,
  );

  useEffect(() => {
    if (data && !error) {
      setAppointments(data.records);
      setIsLoading(false);
    }
  }, [data, error]);

  const handleDeleteClick = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    setDeleteBtnLoading(true);
    try {
      const headers = getAuthHeaders();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${appointmentToDelete}`,
        {
          method: "DELETE",
          headers,
        },
      );

      setAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentToDelete),
      );
      toast.success("Appointment deleted successfully!");
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment.");
    } finally {
      setDeleteBtnLoading(false);
    }
  };

  const handleRowClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailModalOpen(true);
  };

  const typeColors: Record<
    string,
    "primary" | "warning" | "success" | "default"
  > = {
    "On-Site Viewing": "primary",
    "Property Consultation": "success",
  };

  const fields = [
    {
      key: "phone",
      label: "Phone",
      renderValue: (appointment: Appointment) => appointment.phone || "—",
    },
    {
      key: "property",
      label: "Property",
      renderValue: (appointment: Appointment) => (
        <span className="capitalize">{appointment.properties}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      renderValue: (appointment: Appointment) => (
        <Chip
          size="sm"
          className="uppercase font-semibold"
          startContent={<GoDotFill />}
          color={typeColors[appointment.type] || "default"}
          variant="flat"
        >
          {appointment.type}
        </Chip>
      ),
    },
    {
      key: "status",
      label: "Status",
      renderValue: (appointment: Appointment) => {
        const statusColor =
          appointment.status === "Pending"
            ? "warning"
            : appointment.status === "Accepted"
              ? "success"
              : appointment.status === "Rejected"
                ? "danger"
                : "default";

        return (
          <Chip
            size="sm"
            color={statusColor}
            variant="flat"
            className="capitalize font-semibold"
          >
            {appointment.status}
          </Chip>
        );
      },
    },
  ];

  return (
    <div>
      <DashboardCardData
        filter={false}
        loading={isLoading}
        label="APPOINTMENTS"
        description="Manage and respond to all schedule appointments."
        fields={fields}
        data={appointments}
        onRowClick={handleRowClick}
        renderTitle={(appointment: Appointment) => (
          <div className="min-w-0">
            <p className="font-semibold capitalize truncate">
              {appointment.name}
            </p>
            <span className="text-gray-500 text-xs truncate block">
              {appointment.email}
            </span>
          </div>
        )}
        renderActions={(appointment: Appointment) => (
          <button
            className="text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Delete appointment"
            onClick={() => handleDeleteClick(appointment.id)}
          >
            <LuTrash2 size={16} />
          </button>
        )}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteAppointment}
        deleteBtnLoading={deleteBtnLoading}
        message="Are you sure you want to delete this appointment?"
      />

      <AppointmentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default DashboardAppointmentTable;
