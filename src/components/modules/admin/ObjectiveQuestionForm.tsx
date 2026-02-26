/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
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
/* Types */
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

interface ObjectiveQuestionFormProps {
  closeModal: () => void;
  classes: IClass[];
  subjects: ISubject[];
  chapters: IChapter[];
}

/* ============================= */
/* Schema */
/* ============================= */
const schema = z.object({
  classId: z.number().positive("Class is required"),
  subjectId: z.number().positive("Subject is required"),
  chapterId: z.number().positive("Chapter is required"),
  questionText: z.string().min(1, "Question is required"),
  questionMark: z.number().positive("Marks must be positive"),
  options: z.array(z.string().min(1, "Option cannot be empty")).length(4),
  answerOptionIndex: z
    .number()
    .min(0, "Must be between 0-3")
    .max(3, "Must be between 0-3"),
});

type FormData = z.infer<typeof schema>;

/* ============================= */
/* Component */
/* ============================= */
export default function ObjectiveQuestionForm({
  classes,
  subjects,
  chapters,
}: ObjectiveQuestionFormProps) {
  const [createQuestion, { isLoading }] = useCreateQuestionMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      classId: 0,
      subjectId: 0,
      chapterId: 0,
      questionText: "",
      questionMark: 1,
      options: ["", "", "", ""],
      answerOptionIndex: 0,
    },
  });

  const selectedClassId = watch("classId");
  const selectedSubjectId = watch("subjectId");
  const selectedChapterId = watch("chapterId");

  /* ============================= */
  /* Dependent Filtering */
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
  /* Selected Names for Display */
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
  /* Submit */
  /* ============================= */

const onSubmit = async (data: FormData) => {
  try {
    await createQuestion({ type: "OBJECTIVE", ...data }).unwrap();
    toast.success("Objective Question Created Successfully!");
    // closeModal();
  } catch (error: any) {
    toast.error(
      error?.data?.message || "Failed to create Objective Question!"
    );
  }
};

  /* ============================= */
  /* UI */
  /* ============================= */
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

      {/* Question Text */}
      <Input placeholder="Question Text" {...register("questionText")} />
      {errors.questionText && (
        <p className="text-red-500 text-sm">{errors.questionText.message}</p>
      )}

      {/* Marks */}
      <Input
        type="number"
        placeholder="Marks"
        {...register("questionMark", { valueAsNumber: true })}
      />
      {errors.questionMark && (
        <p className="text-red-500 text-sm">{errors.questionMark.message}</p>
      )}

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index}>
            <Input
              placeholder={`Option ${index + 1}`}
              {...register(`options.${index}` as const)}
            />
            {errors.options?.[index] && (
              <p className="text-red-500 text-sm">
                {errors.options[index]?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Correct Answer Index */}
      <Input
        type="number"
        min={0}
        max={3}
        placeholder="Correct Option Index (0-3)"
        {...register("answerOptionIndex", { valueAsNumber: true })}
      />
      {errors.answerOptionIndex && (
        <p className="text-red-500 text-sm">
          {errors.answerOptionIndex.message}
        </p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Objective"}
      </Button>
    </form>
  );
}
