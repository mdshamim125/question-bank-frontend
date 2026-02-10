/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useGetAllClassesQuery } from "@/redux/features/question/class.api";
import { useGetAllSubjectsQuery } from "@/redux/features/question/subject.api";
import { useAssignTeacherMutation } from "@/redux/features/question/teacherAssignment.api";
import { useGetAllUsersQuery } from "@/redux/features/user/user.api";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function TeacherAssignModal() {
  const form = useForm();
  const [assignTeacher] = useAssignTeacherMutation();
  const [open, setOpen] = useState(false);

  const { data: classesData } = useGetAllClassesQuery({});
  const { data: subjectsData } = useGetAllSubjectsQuery({});
  const { data: usersData } = useGetAllUsersQuery();

  // Only teachers
  const teachers =
    usersData?.data?.filter((user) => user.role === "TEACHER") || [];

  const onSubmit = async (data: any) => {
    try {
      const res = await assignTeacher({
        teacherId: Number(data.teacherId),
        subjectId: Number(data.subjectId),
        classId: Number(data.classId),
      }).unwrap();

      if (res.success) {
        toast.success("Teacher assigned successfully");
        form.reset();
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to assign teacher");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Assign Teacher
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Assign Teacher to Subject</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="assign-teacher-form"
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Teacher Select */}
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Teacher</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher: any) => (
                          <SelectItem
                            key={teacher.id}
                            value={String(teacher.id)}
                          >
                            {teacher.name} ({teacher.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class Select */}
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Class</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classesData?.data?.map((cls: any) => (
                          <SelectItem key={cls.id} value={String(cls.id)}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject Select */}
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Subject</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectsData?.data?.map((sub: any) => (
                          <SelectItem key={sub.id} value={String(sub.id)}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="assign-teacher-form">
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
