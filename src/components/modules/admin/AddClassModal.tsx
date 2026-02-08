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
import { Input } from "@/components/ui/input";
import { useCreateClassMutation } from "@/redux/features/question/class.api";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function AddClassModal() {
  const form = useForm();
  const [addClass] = useCreateClassMutation();
  const [open, setOpen] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      const res = await addClass({ name: data.name }).unwrap();
      if (res.success) {
        toast.success("Class Added");
        form.reset();
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to add class");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button className="flex items-center cursor-pointer gap-2">
            <Plus size={18} />
            Add Class
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form id="add-class" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Class Name"
                        {...field}
                        value={field.value || ""}
                      />
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
            <Button type="submit" form="add-class">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
