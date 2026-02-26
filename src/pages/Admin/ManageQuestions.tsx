/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
} from "docx";
import { saveAs } from "file-saver";

// ─── API Hooks ─────────────────────────────────────────────────────────────
import { useGetAllQuestionsQuery } from "@/redux/features/question/question.api";
import { useGetAllHeadersQuery } from "@/redux/features/question/questionHeader.api";
import { useGetAllClassesQuery } from "@/redux/features/question/class.api";
import { useGetAllSubjectsQuery } from "@/redux/features/question/subject.api";
import { useGetAllChaptersQuery } from "@/redux/features/question/chapter.api";
import { useCreateQuestionPaperMutation } from "@/redux/features/question/questionPaper.api";
import AddQuestionModal from "@/components/modules/admin/AddQuestionModal";

// ─── Types ────────────────────────────────────────────────────────────────

interface IOption {
  id: number;
  text: string;
  objectiveQuestionId: number;
}

interface IObjective {
  id: number;
  questionText: string;
  questionMark: number;
  questionId: number;
  answerOptionId: number;
  options: IOption[];
}

interface IAnahote {
  id: number;
  questionText: string;
  questionMark: number;
  questionId: number;
}

interface ISrijonshilSubQuestion {
  id: number;
  srijonshilQuestionId: number;
  questionText: string;
  questionMark: number;
  hint: string | null;
}

interface ISrijonshil {
  id: number;
  prompt: string;
  difficulty: string;
  questionId: number;
  subQuestions: ISrijonshilSubQuestion[];
}

export interface IQuestion {
  id: number;
  type: "OBJECTIVE" | "ANAHOTE" | "SRIJONSHIL";
  subjectId: number;
  chapterId?: number;
  classId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  objective: IObjective | null;
  anahote: IAnahote | null;
  srijonshil: ISrijonshil | null;
  class?: { id: number; name: string; createdAt: string; updatedAt: string };
  subject?: {
    id: number;
    name: string;
    classId: number;
    createdAt: string;
    updatedAt: string;
  };
  chapter?: {
    id: number;
    name: string;
    classId: number;
    subjectId: number;
    createdAt: string;
    updatedAt: string;
  };
  createdBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface IQuestionHeader {
  id: number;
  schoolName: string;
  location: string;
  className: string;
  subject: string;
  examType: string;
  duration: string;
  fullMark: number;
  remark?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ManageQuestions() {
  // ─── Data Fetching ───────────────────────────────────────────────────────
  const { data: questionsRes, isLoading: qLoading } = useGetAllQuestionsQuery();
  const { data: headersRes } = useGetAllHeadersQuery();

  const { data: classesRes, isLoading: classesLoading } = useGetAllClassesQuery(
    { page: 1, limit: 100 },
  );
  const { data: subjectsRes, isLoading: subjectsLoading } =
    useGetAllSubjectsQuery();
  const { data: chaptersRes, isLoading: chaptersLoading } =
    useGetAllChaptersQuery();

  const allQuestions = questionsRes?.data ?? [];
  const savedHeaders = headersRes?.data ?? [];

  const allClasses = classesRes?.data ?? []; // adjust if your response shape is different
  const allSubjects = subjectsRes?.data ?? [];
  const allChapters = chaptersRes?.data ?? [];

  // ─── State ────────────────────────────────────────────────────────────────
  const [selectedQuestions, setSelectedQuestions] = useState<IQuestion[]>([]);
  const [selectedHeader, setSelectedHeader] = useState<IQuestionHeader | null>(
    null,
  );

  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<
    "OBJECTIVE" | "ANAHOTE" | "SRIJONSHIL" | "all"
  >("all");

  const [header, setHeader] = useState({
    schoolName: "",
    location: "",
    className: "",
    subject: "",
    examType: "",
    duration: "",
    fullMark: "",
    remark: "",
  });

  // const [uploadQuestionPaper, { isLoading: isSaving }] =
  //   useUploadQuestionPaperMutation();

  const [createQuestionPaper, { isLoading: isSaving }] =
    useCreateQuestionPaperMutation();

  // ─── Derived filtered dropdown data ──────────────────────────────────────

  const filteredSubjects = allSubjects.filter(
    (s) => selectedClassId === "all" || s.classId === Number(selectedClassId),
  );

  const filteredChapters = allChapters.filter(
    (ch) =>
      (selectedSubjectId === "all" ||
        ch.subjectId === Number(selectedSubjectId)) &&
      (selectedClassId === "all" || ch.classId === Number(selectedClassId)),
  );

  // ─── Filtered questions ───────────────────────────────────────────────────

  const filteredQuestions = allQuestions.filter((q) => {
    if (selectedClassId !== "all" && q.classId !== Number(selectedClassId))
      return false;
    if (
      selectedSubjectId !== "all" &&
      q.subjectId !== Number(selectedSubjectId)
    )
      return false;
    if (
      selectedChapterId !== "all" &&
      q.chapterId !== Number(selectedChapterId)
    )
      return false;
    if (selectedType !== "all" && q.type !== selectedType) return false;
    return true;
  });

  // ─── Header sync ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (selectedHeader) {
      setHeader({
        schoolName: selectedHeader.schoolName,
        location: selectedHeader.location,
        className: selectedHeader.className,
        subject: selectedHeader.subject,
        examType: selectedHeader.examType,
        duration: selectedHeader.duration,
        fullMark: String(selectedHeader.fullMark),
        remark: selectedHeader.remark || "",
      });
    }
  }, [selectedHeader]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getQuestionPreview = (q: IQuestion): string => {
    if (q.type === "SRIJONSHIL" && q.srijonshil) {
      return (q.srijonshil.prompt?.slice(0, 80) ?? "") + "...";
    }
    if (q.type === "OBJECTIVE" && q.objective) {
      return (q.objective.questionText?.slice(0, 80) ?? "") + "...";
    }
    if (q.type === "ANAHOTE" && q.anahote) {
      return (q.anahote.questionText?.slice(0, 80) ?? "") + "...";
    }
    return "No preview available";
  };

  const generatePDF = () => {
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question first.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // ── Optional: Add Bangla font (uncomment & configure if needed) ──────────
    /*
  // 1. Convert .ttf → .js using https://peckconsulting.s3.amazonaws.com/fontconverter/fontconverter.html
  // 2. Save as e.g. SolaimanLipi-normal.js
  // 3. import './fonts/SolaimanLipi-normal.js';   // at top of file
  // Then:
  doc.addFont("SolaimanLipi-normal", "SolaimanLipi", "normal");
  doc.setFont("SolaimanLipi");
  */

    // Default font (Helvetica) – Bangla will be broken
    doc.setFont("helvetica");
    doc.setFontSize(16);

    // Header
    doc.text(header.schoolName || "School Name", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(
      `${header.examType || "Examination"} | Class: ${header.className || ""} | Subject: ${header.subject || ""}`,
      105,
      25,
      { align: "center" },
    );
    doc.text(
      `Time: ${header.duration || "—"} | Full Marks: ${header.fullMark || "—"}`,
      105,
      32,
      { align: "center" },
    );

    if (header.remark) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(header.remark, 105, 40, { align: "center", maxWidth: 180 });
    }

    let y = header.remark ? 55 : 45;

    // Questions
    selectedQuestions.forEach((q, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${index + 1}.`, 15, y);
      y += 7;

      const mainText =
        q.type === "SRIJONSHIL"
          ? q.srijonshil?.prompt
          : q.type === "OBJECTIVE"
            ? q.objective?.questionText
            : q.anahote?.questionText || "";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      // Split long question text manually (very basic wrap)
      const lines = doc.splitTextToSize(mainText, 170);
      doc.text(lines, 22, y);
      y += lines.length * 6 + 4;

      // ── OBJECTIVE (MCQ) ───────────────────────────────────────────────────
      if (q.type === "OBJECTIVE" && q.objective?.options?.length) {
        doc.setFontSize(10);
        q.objective.options.forEach((opt, i) => {
          const letter = String.fromCharCode(97 + i);
          doc.text(`${letter}. ${opt.text}`, 28, y);
          y += 6;
        });
        y += 4;
      }

      // ── SRIJONSHIL (Creative) ─────────────────────────────────────────────
      else if (q.type === "SRIJONSHIL" && q.srijonshil?.subQuestions?.length) {
        doc.setFontSize(10);
        q.srijonshil.subQuestions.forEach((sq, i) => {
          const letter = String.fromCharCode(97 + i);
          const markText = sq.questionMark ? ` [${sq.questionMark}]` : "";
          const subLines = doc.splitTextToSize(
            `${letter}) ${sq.questionText}${markText}`,
            160,
          );
          doc.text(subLines, 28, y);
          y += subLines.length * 5.5 + 2;
        });
        y += 6;
      }

      // ── ANAHOTE (Short answer) ────────────────────────────────────────────
      else if (q.type === "ANAHOTE" && q.anahote) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text(`[Marks: ${q.anahote.questionMark}]`, 28, y);
        y += 10;
      }

      y += 8; // spacing between questions
    });

    doc.save(`${header.examType || "Question"}-Paper.pdf`);
  };

  // ─── DOCX Generator ─────────────────────────────

  const generateDOCX = async () => {
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question first.");
      return;
    }

    const children: (Paragraph | Table)[] = [];

    // ── Header ───────────────────────────────────────────────────────────────
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: header.schoolName ?? "School Name",
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${header.examType ?? "Examination"} Question Paper`,
            bold: true,
            size: 28,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Class: ${header.className ?? "—"} | Subject: ${header.subject ?? "—"} | Time: ${header.duration ?? "—"} | Marks: ${header.fullMark ?? "—"}`,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    );

    if (header.remark) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: header.remark, italics: true, size: 22 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        }),
      );
    }

    // ── Questions ────────────────────────────────────────────────────────────
    selectedQuestions.forEach((q, index) => {
      const mainText =
        q.type === "SRIJONSHIL"
          ? (q.srijonshil?.prompt ?? "")
          : q.type === "OBJECTIVE"
            ? (q.objective?.questionText ?? "")
            : (q.anahote?.questionText ?? "No question text");

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. ${mainText}`, bold: true }),
          ],
          spacing: { after: 200 },
        }),
      );

      // OBJECTIVE → MCQ options as simple table (2 columns)
      if (q.type === "OBJECTIVE" && q.objective?.options?.length) {
        const rows: TableRow[] = [];
        const opts = q.objective.options;

        for (let i = 0; i < opts.length; i += 2) {
          const cells: TableCell[] = [];

          cells.push(
            new TableCell({
              children: [
                new Paragraph(
                  `${String.fromCharCode(97 + i)}. ${opts[i].text}`,
                ),
              ],
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            }),
          );

          if (i + 1 < opts.length) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph(
                    `${String.fromCharCode(97 + i + 1)}. ${opts[i + 1].text}`,
                  ),
                ],
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
              }),
            );
          }

          rows.push(new TableRow({ children: cells }));
        }

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          }),
        );
      }

      // SRIJONSHIL sub-questions
      if (q.type === "SRIJONSHIL" && q.srijonshil?.subQuestions?.length) {
        q.srijonshil.subQuestions.forEach((sq, i) => {
          const mark = sq.questionMark ? ` [${sq.questionMark}]` : "";
          children.push(
            new Paragraph({
              children: [
                new TextRun(
                  `${String.fromCharCode(97 + i)}) ${sq.questionText}${mark}`,
                ),
              ],
              indent: { left: 720 },
            }),
          );
        });
      }

      // ANAHOTE marks
      if (q.type === "ANAHOTE" && q.anahote) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[Marks: ${q.anahote.questionMark}]`,
                italics: true,
              }),
            ],
            indent: { left: 720 },
          }),
        );
      }

      children.push(new Paragraph({ text: "", spacing: { after: 400 } }));
    });

    const doc = new Document({
      sections: [{ children }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${header.examType ?? "Question"}-Paper.docx`);
  };

  // ─── Save Question Paper ─────────────────────────────────────
  // const handleSavePaper = async () => {
  //   if (selectedQuestions.length === 0)
  //     return alert("Select at least one question.");

  //   try {
  //     const formData = new FormData();
  //     formData.append("title", header.schoolName || "Generated Paper");
  //     formData.append("userId", "1"); // replace with logged-in user ID
  //     formData.append(
  //       "questionIds",
  //       JSON.stringify(selectedQuestions.map((q) => q.id)),
  //     );

  //     const response = await uploadQuestionPaper(formData).unwrap();
  //     alert(`Paper saved! ID: ${response.data.id}`);
  //     setSelectedQuestions([]);
  //     setHeader({
  //       schoolName: "",
  //       location: "",
  //       className: "",
  //       subject: "",
  //       examType: "",
  //       duration: "",
  //       fullMark: "",
  //       remark: "",
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to save paper.");
  //   }
  // };

  const handleSavePaper = async () => {
    if (selectedQuestions.length === 0)
      return alert("Select at least one question.");

    // console.log(selectedQuestions);

    try {
      const payload = {
        title: `${header.examType || "Question Paper"} - ${header.className}`,
        header: {
          schoolName: header.schoolName,
          location: header.location,
          className: header.className,
          subject: header.subject,
          examType: header.examType,
          duration: header.duration,
          fullMark: Number(header.fullMark),
          remark: header.remark,
        },
        questionIds: selectedQuestions.map((q) => q.id),
      };

      console.log(payload);

      const res = await createQuestionPaper(payload).unwrap();

      console.log(res);

      alert(`✅ Paper saved successfully! ID: ${res.data.id}`);

      // Reset
      setSelectedQuestions([]);
      setHeader({
        schoolName: "",
        location: "",
        className: "",
        subject: "",
        examType: "",
        duration: "",
        fullMark: "",
        remark: "",
      });
    } catch (err: any) {
      console.error("Save paper error:", err);
      alert(err?.data?.message || "Failed to save paper");
    }
  };

  const isLoading =
    qLoading || classesLoading || subjectsLoading || chaptersLoading;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add Questions</h1>
        <AddQuestionModal
          classes={allClasses}
          subjects={allSubjects}
          chapters={allChapters}
        />
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Filter & Select Questions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div>
            <Label>Class</Label>
            {classesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedClassId}
                onValueChange={(v) => {
                  setSelectedClassId(v);
                  setSelectedSubjectId("all");
                  setSelectedChapterId("all");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {allClasses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label>Subject</Label>
            {subjectsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
                disabled={
                  selectedClassId === "all" || filteredSubjects.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {filteredSubjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label>Chapter (optional)</Label>
            {chaptersLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedChapterId}
                onValueChange={setSelectedChapterId}
                disabled={
                  selectedSubjectId === "all" || filteredChapters.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Chapters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chapters</SelectItem>
                  {filteredChapters.map((ch) => (
                    <SelectItem key={ch.id} value={String(ch.id)}>
                      {ch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label>Question Type</Label>
            <Select
              value={selectedType}
              onValueChange={(v) => setSelectedType(v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="OBJECTIVE">Objective (MCQ)</SelectItem>
                <SelectItem value="ANAHOTE">Anahote (Short Answer)</SelectItem>
                <SelectItem value="SRIJONSHIL">
                  Srijonshil (Creative)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedQuestions([]);
                setSelectedClassId("all");
                setSelectedSubjectId("all");
                setSelectedChapterId("all");
                setSelectedType("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Paper Header</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Saved Header (optional)</Label>
            <Select
              onValueChange={(v) =>
                setSelectedHeader(
                  savedHeaders.find((h) => h.id === Number(v)) || null,
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Use new header" />
              </SelectTrigger>
              <SelectContent>
                {savedHeaders.map((h) => (
                  <SelectItem key={h.id} value={String(h.id)}>
                    {h.examType} - {h.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="School Name"
            value={header.schoolName}
            onChange={(e) =>
              setHeader({ ...header, schoolName: e.target.value })
            }
          />
          <Input
            placeholder="Exam Type"
            value={header.examType}
            onChange={(e) => setHeader({ ...header, examType: e.target.value })}
          />
          <Input
            placeholder="Class"
            value={header.className}
            onChange={(e) =>
              setHeader({ ...header, className: e.target.value })
            }
          />
          <Input
            placeholder="Subject"
            value={header.subject}
            onChange={(e) => setHeader({ ...header, subject: e.target.value })}
          />
          <Input
            placeholder="Duration"
            value={header.duration}
            onChange={(e) => setHeader({ ...header, duration: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Full Marks"
            value={header.fullMark}
            onChange={(e) => setHeader({ ...header, fullMark: e.target.value })}
          />
          <Textarea
            placeholder="Instructions / Remark"
            value={header.remark}
            onChange={(e) => setHeader({ ...header, remark: e.target.value })}
            className="md:col-span-2"
          />
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Questions{" "}
            {filteredQuestions.length > 0 && `(${filteredQuestions.length})`}
          </CardTitle>
          <Badge variant="outline">Selected: {selectedQuestions.length}</Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No questions match the current filters.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q) => {
                const isSelected = selectedQuestions.some((s) => s.id === q.id);
                return (
                  <div
                    key={q.id}
                    className={`p-4 border rounded-lg transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedQuestions([...selectedQuestions, q]);
                          } else {
                            setSelectedQuestions(
                              selectedQuestions.filter((s) => s.id !== q.id),
                            );
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{q.type}</Badge>
                          <span className="font-medium">
                            {getQuestionPreview(q)}
                          </span>
                        </div>

                        {q.type === "OBJECTIVE" && q.objective && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {q.objective.options.map((opt) => (
                              <div
                                key={opt.id}
                                className="px-3 py-1 bg-muted/40 rounded"
                              >
                                {String.fromCharCode(97 + (opt.id - 1))}.{" "}
                                {opt.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === "SRIJONSHIL" && q.srijonshil && (
                          <ul className="ml-4 list-decimal text-sm space-y-1 mt-2">
                            {q.srijonshil.subQuestions.map((sq, idx) => (
                              <li key={idx}>
                                {sq.questionText}{" "}
                                <span className="text-muted-foreground">
                                  [{sq.questionMark}]
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {q.type === "ANAHOTE" && q.anahote && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Short answer — Marks: {q.anahote.questionMark}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Actions
      <div className="flex justify-end gap-4 sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 -mx-6 border-t">
        <Button
          size="lg"
          onClick={generatePDF}
          disabled={selectedQuestions.length === 0}
        >
          Generate PDF
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={generateDOCX}
          disabled={selectedQuestions.length === 0}
        >
          Generate DOCX
        </Button>
      </div> */}
      {/* Export & Save Actions */}
      <div className="flex justify-end gap-4 sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 -mx-6 border-t">
        <Button
          size="lg"
          onClick={handleSavePaper}
          disabled={selectedQuestions.length === 0 || isSaving}
        >
          {isSaving ? "Saving..." : "Save Paper"}
        </Button>
        <Button
          size="lg"
          onClick={() => {
            /* call your generatePDF */
            generatePDF();
          }}
          disabled={selectedQuestions.length === 0}
        >
          Generate PDF
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            /* call your generateDOCX */
            generateDOCX();
          }}
          disabled={selectedQuestions.length === 0}
        >
          Generate DOCX
        </Button>
      </div>
    </div>
  );
}
