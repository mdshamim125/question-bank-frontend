/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { TeacherAssignModal } from "@/components/modules/admin/TeacherAssignModal";
import {
  useGetAllAssignmentsQuery,
  useRemoveAssignmentMutation,
} from "@/redux/features/question/teacherAssignment.api";
import type { ITeacherSubjectAssignment } from "@/type/question/teacherSubject.type";

export default function TeacherSubjectAssign() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);

  const { data } = useGetAllAssignmentsQuery(undefined);
  const [removeAssignment] = useRemoveAssignmentMutation();

  console.log(data);

  // Delete by assignment ID
  const handleDelete = async (id: number) => {
    console.log(id);
    const toastId = toast.loading("Removing...");
    try {
      const res = await removeAssignment(id).unwrap();
      if (res.success) {
        toast.success("Assignment removed", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove assignment", { id: toastId });
    }
  };

  const totalPage = Math.ceil((data?.data?.length || 0) / limit);

  const paginatedData = data?.data?.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-5">
      <div className="flex flex-col justify-between min-h-[calc(100vh-120px)]">
        <div>
          <div className="flex justify-between my-8">
            <h1 className="text-xl font-semibold">
              Teacher Subject Assignments
            </h1>
            <TeacherAssignModal />
          </div>

          <div className="border border-muted rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData?.map((item: ITeacherSubjectAssignment) => (
                  <TableRow key={`${item.teacherId}-${item.subjectId}`}>
                    <TableCell>{item?.teacher?.name}</TableCell>
                    <TableCell>{item.class?.name || item.classId}</TableCell>
                    <TableCell>
                      {item.subject?.name || item.subjectId}
                    </TableCell>

                    <TableCell>
                      <DeleteConfirmation
                        onConfirm={() => handleDelete(item.id)}
                      >
                        <Button size="sm" variant="destructive">
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
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
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
