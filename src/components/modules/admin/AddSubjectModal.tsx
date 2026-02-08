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
import { Input } from "@/components/ui/input";

import { useGetAllClassesQuery } from "@/redux/features/question/class.api";
import { useCreateSubjectMutation } from "@/redux/features/question/subject.api";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface IFormInput {
  name: string;
  classId: number;
}

export function AddSubjectModal() {
  const form = useForm<IFormInput>();
  const [addSubject] = useCreateSubjectMutation();
  const [open, setOpen] = useState(false);

  const { data: classData } = useGetAllClassesQuery({}); // Fetch all classes for dropdown

  const onSubmit = async (data: IFormInput) => {
    try {
      const res = await addSubject(data).unwrap();
      if (res.success) {
        toast.success("Subject Added");
        form.reset();
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to add subject");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Add Subject
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Subject</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              id="add-subject-form"
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              {/* Subject Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Subject Name"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Class Dropdown */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classData?.data?.map((cls: any) => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
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
            </form>
          </Form>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form="add-subject-form">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
