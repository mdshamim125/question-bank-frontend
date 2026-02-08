import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  useDeleteClassMutation,
  useGetAllClassesQuery,
} from "@/redux/features/question/class.api";
import { AddClassModal } from "@/components/modules/admin/AddClassModal";
import type { IClass } from "@/type/question/class.type";

export default function AddClass() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);

  const { data } = useGetAllClassesQuery({ page: currentPage, limit });
  const [removeClass] = useDeleteClassMutation();

  const handleRemoveClass = async (classId: string) => {
    console.log(classId);
    const toastId = toast.loading("Removing...");
    try {
      const res = await removeClass(classId).unwrap();

      if (res.success) {
        toast.success("Class Removed", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove class", { id: toastId });
    }
  };

  const totalPage = data?.meta?.totalPage || 1;

  return (
    <div className="w-full max-w-7xl mx-auto px-5">
      <div className="flex flex-col justify-between min-h-[calc(100vh-120px)]">
        <div>
          <div className="flex justify-between my-8">
            <h1 className="text-xl font-semibold">List of Classes</h1>
            <AddClassModal />
          </div>

          <div className="border border-muted rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Class Name</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((item: IClass) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium w-full">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <DeleteConfirmation
                        onConfirm={() => handleRemoveClass(item.id.toString())}
                      >
                        <Button size="sm">
                          <Trash2 />
                        </Button>
                      </DeleteConfirmation>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPage > 1 && (
          <div className="flex justify-end mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPage }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem
                      key={page}
                      onClick={() => setCurrentPage(page)}
                    >
                      <PaginationLink
                        className={`cursor-pointer ${
                          currentPage === page
                            ? "bg-primary text-white"
                            : "hover:bg-muted"
                        }`}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPage))
                    }
                    className={
                      currentPage === totalPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
