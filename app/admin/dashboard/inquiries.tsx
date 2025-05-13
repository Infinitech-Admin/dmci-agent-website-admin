"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import DeleteConfirmationModal from "@/app/components/modal/deletemodal";

import { getAuthHeaders } from "@/app/utility/auth";
import { LuPenLine, LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import DashboardTableData from "@/app/components/dashboardtabledata";

type Category = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  property_name: string;
  property_location: string;
  unit_type: string;
  message: string;
};

const DashboardInquiryTable: React.FC = () => {
  const router = useRouter();

  const fetcherWithAuth = async (url: string) => {
    const headers = getAuthHeaders();

    const res = await fetch(url, {
      method: "GET",
      headers: headers,
    });

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
  const { data, error, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/inquiries`,
    fetcherWithAuth
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [categoryToUpdate, setCategoryToUpdate] = useState<Category | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [deleteBtnLoading, setDeleteBtnLoading] = useState(false);

  useEffect(() => {
    if (data && !error) {
      setCategories(data.records);
      setIsLoading(false);
    }
  }, [data, error]);

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleteBtnLoading(true);
    try {
      await deleteCategory(categoryToDelete);
      toast.success("Inquiry deleted successfully!");
      setDeleteModalOpen(false);
      setDeleteBtnLoading(false);
    } catch (error) {
      console.error("Error deleting inquiry:", error);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const headers = getAuthHeaders();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${categoryId}`,
        {
          method: "DELETE",
          headers: headers,
        }
      );
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
      );
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const closeUpdateModal = () => setUpdateModalOpen(false);

  const columns = [
    // { label: 'ID', accessor: (category: Category) => category.id },
    {
      key: "name",
      label: "Name and Email",
      renderCell: (category: Category) => (
        <div>
        <p className="font-semibold">
  {`${category.first_name.charAt(0).toUpperCase()}${category.first_name.slice(1).toLowerCase()} ${category.last_name.charAt(0).toUpperCase()}${category.last_name.slice(1).toLowerCase()}`}
</p>

          <span className="text-gray-500 text-md">{category.email}</span>
        </div>
      ),
    },

    {
      key: "property",
      label: "Property",
      renderCell: (category: Category) => category.property_name,
    },
    {
      key: "unit",
      label: "Unit/PS Type",
      renderCell: (category: Category) => category.unit_type,
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
          label="INQUIRIES"
          description="Manage and respond to all inquiries."
          columns={columns}
          data={categories}
        />
      )}
    </div>
  );
};

export default DashboardInquiryTable;
