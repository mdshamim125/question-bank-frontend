/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateQuestionMutation } from "@/redux/features/question/question.api";
import { toast } from "sonner";

/* ============================= */
/* Types for Classes, Subjects, Chapters */
/* ============================= */
interface IClass {
  id: number;
  name: string;
}

interface ISubject {
  id: number;
  name: string;
  classId: number;
}

interface IChapter {
  id: number;
  name: string;
  classId: number;
  subjectId: number;
}

interface SrijonshilQuestionFormProps {
  closeModal: () => void;
  classes: IClass[];
  subjects: ISubject[];
  chapters: IChapter[];
}

/* ============================= */
/* Zod Schema */
/* ============================= */
const schema = z.object({
  classId: z.number().positive("Class is required"),
  subjectId: z.number().positive("Subject is required"),
  chapterId: z.number().positive("Chapter is required"),
  prompt: z.string().min(1, "Prompt is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  subQuestions: z.array(
    z.object({
      questionText: z.string().min(1, "Sub-question text is required"),
      questionMark: z.number().positive("Marks must be positive"),
      hint: z.string().optional(),
    }),
  ),
});

type FormData = z.infer<typeof schema>;

/* ============================= */
/* Component */
/* ============================= */
export default function SrijonshilQuestionForm({
  classes,
  subjects,
  chapters,
}: SrijonshilQuestionFormProps) {
  const [createQuestion, { isLoading }] = useCreateQuestionMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      classId: 0,
      subjectId: 0,
      chapterId: 0,
      prompt: "",
      difficulty: "EASY",
      subQuestions: [{ questionText: "", questionMark: 1, hint: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subQuestions",
  });

  const selectedClassId = watch("classId");
  const selectedSubjectId = watch("subjectId");
  const selectedChapterId = watch("chapterId");
  const selectedDifficulty = watch("difficulty");

  /* ============================= */
  /* Filtered options based on selections */
  /* ============================= */
  const filteredSubjects = useMemo(
    () => subjects.filter((s) => s.classId === selectedClassId),
    [subjects, selectedClassId],
  );

  const filteredChapters = useMemo(
    () =>
      chapters.filter(
        (c) =>
          c.classId === selectedClassId && c.subjectId === selectedSubjectId,
      ),
    [chapters, selectedClassId, selectedSubjectId],
  );

  /* ============================= */
  /* Display names for SelectValue */
  /* ============================= */
  const selectedClassName = useMemo(() => {
    const cls = classes.find((c) => c.id === selectedClassId);
    return cls ? cls.name : "Select Class";
  }, [classes, selectedClassId]);

  const selectedSubjectName = useMemo(() => {
    const subj = subjects.find((s) => s.id === selectedSubjectId);
    return subj ? subj.name : "Select Subject";
  }, [subjects, selectedSubjectId]);

  const selectedChapterName = useMemo(() => {
    const ch = chapters.find((c) => c.id === selectedChapterId);
    return ch ? ch.name : "Select Chapter";
  }, [chapters, selectedChapterId]);

  /* ============================= */
  /* Submit handler */
  /* ============================= */
  const onSubmit = async (data: FormData) => {
    try {
      await createQuestion({ type: "SRIJONSHIL", ...data }).unwrap();
      toast.success("Srijonshil Question Created Successfully!");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to create Srijonshil Question!",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Class */}
      <Select
        value={selectedClassId.toString()}
        onValueChange={(val) => setValue("classId", Number(val))}
      >
        <SelectTrigger>
          <SelectValue>{selectedClassName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id.toString()}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.classId && (
        <p className="text-red-500 text-sm">{errors.classId.message}</p>
      )}

      {/* Subject */}
      <Select
        value={selectedSubjectId.toString()}
        onValueChange={(val) => setValue("subjectId", Number(val))}
        disabled={!selectedClassId}
      >
        <SelectTrigger>
          <SelectValue>{selectedSubjectName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filteredSubjects.map((subj) => (
            <SelectItem key={subj.id} value={subj.id.toString()}>
              {subj.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.subjectId && (
        <p className="text-red-500 text-sm">{errors.subjectId.message}</p>
      )}

      {/* Chapter */}
      <Select
        value={selectedChapterId.toString()}
        onValueChange={(val) => setValue("chapterId", Number(val))}
        disabled={!selectedSubjectId}
      >
        <SelectTrigger>
          <SelectValue>{selectedChapterName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filteredChapters.map((ch) => (
            <SelectItem key={ch.id} value={ch.id.toString()}>
              {ch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.chapterId && (
        <p className="text-red-500 text-sm">{errors.chapterId.message}</p>
      )}

      {/* Prompt */}
      <Input placeholder="Prompt" {...register("prompt")} />
      {errors.prompt && (
        <p className="text-red-500 text-sm">{errors.prompt.message}</p>
      )}

      {/* Difficulty */}
      <Select
        value={selectedDifficulty}
        onValueChange={(val) =>
          setValue("difficulty", val as "EASY" | "MEDIUM" | "HARD")
        }
      >
        <SelectTrigger>
          <SelectValue>{selectedDifficulty}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="EASY">EASY</SelectItem>
          <SelectItem value="MEDIUM">MEDIUM</SelectItem>
          <SelectItem value="HARD">HARD</SelectItem>
        </SelectContent>
      </Select>

      {/* Sub-questions */}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="border p-3 rounded space-y-2">
            <Input
              placeholder="Sub Question Text"
              {...register(`subQuestions.${index}.questionText`)}
            />
            {errors.subQuestions?.[index]?.questionText && (
              <p className="text-red-500 text-sm">
                {errors.subQuestions[index]?.questionText?.message}
              </p>
            )}

            <Input
              type="number"
              placeholder="Marks"
              {...register(`subQuestions.${index}.questionMark`, {
                valueAsNumber: true,
              })}
            />
            {errors.subQuestions?.[index]?.questionMark && (
              <p className="text-red-500 text-sm">
                {errors.subQuestions[index]?.questionMark?.message}
              </p>
            )}

            <Input
              placeholder="Hint (optional)"
              {...register(`subQuestions.${index}.hint`)}
            />

            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({ questionText: "", questionMark: 1, hint: "" })
          }
        >
          Add Sub Question
        </Button>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Srijonshil"}
      </Button>
    </form>
  );
}
