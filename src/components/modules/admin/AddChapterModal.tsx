/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateChapterMutation } from "@/redux/features/question/chapter.api";
import { useGetAllClassesQuery } from "@/redux/features/question/class.api";
import { useGetAllSubjectsQuery } from "@/redux/features/question/subject.api";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type ChapterFormValues = {
  name: string;
  classId: string;
  subjectId: string;
};

export function AddChapterModal() {
  const [open, setOpen] = useState(false);
  const [addChapter] = useCreateChapterMutation();

  const { data: classesData } = useGetAllClassesQuery({});
  const { data: subjectsData, refetch } = useGetAllSubjectsQuery({});

  const form = useForm<ChapterFormValues>({
    defaultValues: {
      name: "",
      classId: "",
      subjectId: "",
    },
  });

  const onSubmit = async (data: ChapterFormValues) => {
    try {
      const payload = {
        name: data.name,
        classId: Number(data.classId),
        subjectId: Number(data.subjectId),
      };

      console.log("Payload 👉", payload);

      const res = await addChapter(payload).unwrap();

      if (res.success) {
        toast.success("Chapter added successfully");
        form.reset();
        setOpen(false);
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add chapter");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Add Chapter
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add Chapter</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="add-chapter-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Chapter Name */}
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Chapter name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Chapter Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class Select */}
            <FormField
              control={form.control}
              name="classId"
              rules={{ required: "Class is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
              rules={{ required: "Subject is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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

          <Button type="submit" form="add-chapter-form">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
