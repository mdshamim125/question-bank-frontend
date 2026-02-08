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
import {
  useDeleteChapterMutation,
  useGetAllChaptersQuery,
} from "@/redux/features/question/chapter.api";
import { AddChapterModal } from "@/components/modules/admin/AddChapterModal";
import type { IChapter } from "@/type/question/chapter.type";

export default function AddChapter() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);

  const { data } = useGetAllChaptersQuery(undefined); // you can modify to accept pagination params if your API supports
  const [deleteChapter] = useDeleteChapterMutation();

  const handleDeleteChapter = async (chapterId: string) => {
    const toastId = toast.loading("Deleting...");
    try {
      const res = await deleteChapter(chapterId).unwrap();
      if (res.success) {
        toast.success("Chapter deleted", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chapter", { id: toastId });
    }
  };

  const totalPage = Math.ceil((data?.data?.length || 0) / limit);

  // Paginate locally for demo (if backend pagination exists, replace this)
  const paginatedData = data?.data?.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-5">
      <div className="flex flex-col justify-between min-h-[calc(100vh-120px)]">
        <div>
          <div className="flex justify-between my-8">
            <h1 className="text-xl font-semibold">List of Chapters</h1>
            <AddChapterModal />
          </div>

          <div className="border border-muted rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chapter Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData?.map((chapter: IChapter) => (
                  <TableRow key={chapter.id}>
                    <TableCell>{chapter.name}</TableCell>
                    <TableCell>{chapter.class?.name || "-"}</TableCell>
                    <TableCell>{chapter.subject?.name || "-"}</TableCell>
                    <TableCell>
                      <DeleteConfirmation
                        onConfirm={() =>
                          handleDeleteChapter(chapter.id.toString())
                        }
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
