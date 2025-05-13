'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import DeleteConfirmationModal from '@/app/components/modal/deletemodal';
import { getAuthHeaders } from '@/app/utility/auth';
import { LuTrash2 } from 'react-icons/lu';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/react';
import { GoDotFill } from 'react-icons/go';
import DashboardTableData from '@/app/components/dashboardtabledata';

type Appointment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  properties: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Other'; // Add the 'status' property
};

const DashboardAppointmentTable: React.FC = () => {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [deleteBtnLoading, setDeleteBtnLoading] = useState(false);

  const fetcherWithAuth = async (url: string) => {
    const headers = getAuthHeaders();
    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (res.status === 401) {
      router.replace('/auth/login');
      return;
    }

    if (res.status === 429) {
      toast.error('Too many requests. Please try again later.');
      return;
    }

    return await res.json();
  };

  const { data, error, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/appointments`,
    fetcherWithAuth
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${appointmentToDelete}`, {
        method: 'DELETE',
        headers,
      });

      setAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentToDelete)
      );
      toast.success('Appointment deleted successfully!');
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment.');
    } finally {
      setDeleteBtnLoading(false);
    }
  };

  const Status: Record<string, 'primary' | 'warning' | 'success' | 'default'> = {
    'On-Site Viewing': 'primary',
    'Property Consultation': 'success',
  };

  const columns = [
    {
      key: 'name',
      label: 'Name and Email',
      renderCell: (appointment: Appointment) => (
        <div>
          <p className="font-semibold capitalize">{appointment.name}</p>
          <span className="text-gray-500 text-md">{appointment.email}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      renderCell: (appointment: Appointment) => (
        <span className="text-sm text-gray-800">{appointment.phone}</span>
      ),
    },
    {
      key: 'unit',
      label: 'Property',
      renderCell: (appointment: Appointment) => (
        <div className="capitalize">{appointment.properties}</div>
      ),
    },
    {
      key: 'type',
      label: 'Appointment Type',
      renderCell: (appointment: Appointment) => {
        const typeLabel = appointment.type;
        const chipColor = Status[typeLabel] || 'default';
  
        return (
          <Chip
            size="sm"
            className="uppercase font-semibold"
            startContent={<GoDotFill />}
            color={chipColor}
            variant="flat"
          >
            {typeLabel}
          </Chip>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      renderCell: (appointment: Appointment) => {
        const status = appointment.status;
        const statusColor =
          status === 'Pending'
            ? 'warning'
            : status === 'Accepted'
            ? 'success'
            : status === 'Rejected'
            ? 'danger'
            : 'default';
  
        return (
          <Chip
            size="sm"
            color={statusColor}
            variant="flat"
            className="capitalize font-semibold"
          >
            {status}
          </Chip>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      renderCell: (appointment: Appointment) => (
        <div className="flex gap-2">
          <Button
            isIconOnly
            startContent={<LuTrash2 size={18} />}
            variant="flat"
            color="danger"
            onPress={() => handleDeleteClick(appointment.id)}
          />
        </div>
      ),
    },
  ];
  

  return (
    <div>
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(itemsPerPage)].map((_, index) => (
            <div key={index} className="h-10 bg-gray-300 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <DashboardTableData
          filter={false}
          label="APPOINTMENTS"
          description="Manage and respond to all schedule appointments."
          columns={columns}
          data={appointments}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteAppointment}
        deleteBtnLoading={deleteBtnLoading}
        message="Are you sure you want to delete this appointment?"
      />
    </div>
  );
};

export default DashboardAppointmentTable;
