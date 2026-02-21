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
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

// ─── API Hooks ─────────────────────────────────────────────────────────────
import { useGetAllQuestionsQuery } from "@/redux/features/question/question.api";
import { useGetAllHeadersQuery } from "@/redux/features/question/questionHeader.api";
import { useGetAllClassesQuery } from "@/redux/features/question/class.api";
import { useGetAllSubjectsQuery } from "@/redux/features/question/subject.api";
import { useGetAllChaptersQuery } from "@/redux/features/question/chapter.api";

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

  // ─── Generators (add your full implementation here) ───────────────────────

  // const generatePDF = () => {
  //   if (selectedQuestions.length === 0) return;

  //   const doc = new jsPDF("p", "mm", "a4");

  //   // Use built-in font
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(16);
  //   doc.text(header.schoolName || "School Name", 105, 15, { align: "center" });

  //   doc.setFontSize(12);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(
  //     `${header.examType || "Examination"} | Class: ${header.className || ""}`,
  //     105,
  //     22,
  //     { align: "center" },
  //   );
  //   doc.text(
  //     `Subject: ${header.subject || ""} | Time: ${header.duration} | Full Marks: ${header.fullMark}`,
  //     105,
  //     28,
  //     { align: "center" },
  //   );

  //   let y = 40;
  //   selectedQuestions.forEach((q, i) => {
  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(12);
  //     doc.text(`${i + 1}. `, 10, y);
  //     y += 6;

  //     if (q.type === "SRIJONSHIL" && q.srijonshil) {
  //       doc.setFont("helvetica", "normal");
  //       doc.text(q.srijonshil.prompt, 18, y);
  //       y += 8;
  //       q.srijonshil.subQuestions.forEach((sq, idx) => {
  //         doc.text(
  //           `(${String.fromCharCode(97 + idx)}) ${sq.questionText}  [${sq.questionMark}]`,
  //           22,
  //           y,
  //         );
  //         y += 7;
  //       });
  //     } else if (q.type === "OBJECTIVE" && q.objective) {
  //       doc.text(q.objective.questionText, 18, y);
  //       y += 8;
  //       doc.setFontSize(11);
  //       q.objective.options.forEach((opt, idx) => {
  //         doc.text(`${String.fromCharCode(97 + idx)}. ${opt.text}`, 25, y);
  //         y += 6;
  //       });
  //     } else if (q.type === "ANAHOTE" && q.anahote) {
  //       doc.text(q.anahote.questionText, 18, y);
  //       y += 8;
  //       doc.setFont("helvetica", "italic");
  //       doc.setFontSize(10);
  //       doc.text(`[Marks: ${q.anahote.questionMark}]`, 25, y);
  //       y += 6;
  //     }
  //     y += 8;
  //     if (y > 270) {
  //       doc.addPage();
  //       y = 20;
  //     }
  //   });

  //   doc.save("question-paper.pdf");
  // };


  // const generateDOCX = async () => {
  //   if (selectedQuestions.length === 0) {
  //     alert("Please select at least one question");
  //     return;
  //   }

  //   const children: Paragraph[] = [
  //     new Paragraph({
  //       children: [
  //         new TextRun({
  //           text: header.schoolName || "School Name",
  //           bold: true,
  //           size: 32,
  //         }),
  //       ],
  //       alignment: "center",
  //     }),

  //     new Paragraph({
  //       text: `${header.examType || "Examination"} | Class ${header.className || ""}`,
  //       alignment: "center",
  //     }),

  //     new Paragraph({
  //       text: `Subject: ${header.subject || ""} | Time: ${header.duration} | Marks: ${header.fullMark}`,
  //       alignment: "center",
  //     }),

  //     new Paragraph(""), // spacer
  //   ];

  //   selectedQuestions.forEach((q, i) => {
  //     const mainText =
  //       q.type === "SRIJONSHIL"
  //         ? q.srijonshil?.prompt
  //         : q.type === "OBJECTIVE"
  //           ? q.objective?.questionText
  //           : q.anahote?.questionText || "";

  //     children.push(
  //       new Paragraph({
  //         text: `${i + 1}. ${mainText || ""}`,
  //         spacing: { after: 200 },
  //       }),
  //     );

  //     if (q.type === "SRIJONSHIL" && q.srijonshil) {
  //       q.srijonshil.subQuestions.forEach((sq, idx) => {
  //         children.push(
  //           new Paragraph({
  //             text: `(${String.fromCharCode(97 + idx)}) ${sq.questionText} [${sq.questionMark}]`,
  //             indent: { left: 720 },
  //           }),
  //         );
  //       });
  //     } else if (q.type === "OBJECTIVE" && q.objective) {
  //       q.objective.options.forEach((opt, idx) => {
  //         children.push(
  //           new Paragraph({
  //             text: `${String.fromCharCode(97 + idx)}. ${opt.text}`,
  //             indent: { left: 1080 },
  //           }),
  //         );
  //       });
  //     } else if (q.type === "ANAHOTE" && q.anahote) {
  //       children.push(
  //         new Paragraph({
  //           text: `[Marks: ${q.anahote.questionMark}]`,
  //           italic: true,
  //         }),
  //       );
  //     }

  //     children.push(new Paragraph("")); // spacer between questions
  //   });

  //   const doc = new Document({
  //     sections: [{ children }],
  //   });

  //   const blob = await Packer.toBlob(doc);
  //   saveAs(blob, "question-paper.docx");
  // };


  const generatePDF = () => {
  if (selectedType === "all") {
    alert("Please select a Question Type first");
    return;
  }

  const questions = filteredQuestions; // only selected type

  if (questions.length === 0) {
    alert("No questions found for this type");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(header.schoolName || "School Name", 105, 15, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`${selectedType} Question Paper`, 105, 22, { align: "center" });

  let y = 40;

  questions.forEach((q, i) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}.`, 10, y);
    y += 6;

    if (q.type === "OBJECTIVE" && q.objective) {
      doc.text(q.objective.questionText, 18, y);
      y += 8;

      q.objective.options.forEach((opt, idx) => {
        doc.text(`${String.fromCharCode(97 + idx)}. ${opt.text}`, 25, y);
        y += 6;
      });
    }

    if (q.type === "SRIJONSHIL" && q.srijonshil) {
      doc.text(q.srijonshil.prompt, 18, y);
      y += 8;

      q.srijonshil.subQuestions.forEach((sq, idx) => {
        doc.text(
          `(${String.fromCharCode(97 + idx)}) ${sq.questionText} [${sq.questionMark}]`,
          22,
          y,
        );
        y += 6;
      });
    }

    if (q.type === "ANAHOTE" && q.anahote) {
      doc.text(q.anahote.questionText, 18, y);
      y += 6;
      doc.text(`[Marks: ${q.anahote.questionMark}]`, 22, y);
      y += 6;
    }

    y += 8;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save(`${selectedType}-question-paper.pdf`);
};


const generateDOCX = async () => {
  if (selectedType === "all") {
    alert("Please select a Question Type first");
    return;
  }

  const questions = filteredQuestions;
  if (questions.length === 0) return;

  const children: Paragraph[] = [];

  questions.forEach((q, i) => {
    const text =
      q.type === "OBJECTIVE"
        ? q.objective?.questionText
        : q.type === "SRIJONSHIL"
        ? q.srijonshil?.prompt
        : q.anahote?.questionText;

    children.push(new Paragraph(`${i + 1}. ${text}`));
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${selectedType}-question-paper.docx`);
};


  const isLoading =
    qLoading || classesLoading || subjectsLoading || chaptersLoading;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
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

      {/* Export Actions */}
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
      </div>
    </div>
  );
}





// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// import { banglaFonts } from "../pdf/fonts"; // Your Base64 font file
// import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, VerticalAlign, BorderStyle } from "docx";
// import { saveAs } from "file-saver";

// // ─── API Hooks ─────────────────────────────────────────────────────────────
// import { useGetAllQuestionsQuery } from "@/redux/features/question/question.api";
// import { useGetAllHeadersQuery } from "@/redux/features/question/questionHeader.api";
// import { useGetAllClassesQuery } from "@/redux/features/question/class.api";
// import { useGetAllSubjectsQuery } from "@/redux/features/question/subject.api";
// import { useGetAllChaptersQuery } from "@/redux/features/question/chapter.api";

// // ─── Types ────────────────────────────────────────────────────────────────
// interface IOption {
//   id: number;
//   text: string;
//   objectiveQuestionId: number;
// }

// interface IObjective {
//   id: number;
//   questionText: string;
//   questionMark: number;
//   questionId: number;
//   answerOptionId: number;
//   options: IOption[];
// }

// interface IAnahote {
//   id: number;
//   questionText: string;
//   questionMark: number;
//   questionId: number;
// }

// interface ISrijonshilSubQuestion {
//   id: number;
//   srijonshilQuestionId: number;
//   questionText: string;
//   questionMark: number;
//   hint: string | null;
// }

// interface ISrijonshil {
//   id: number;
//   prompt: string;
//   difficulty: string;
//   questionId: number;
//   subQuestions: ISrijonshilSubQuestion[];
// }

// export interface IQuestion {
//   id: number;
//   type: "OBJECTIVE" | "ANAHOTE" | "SRIJONSHIL";
//   subjectId: number;
//   chapterId?: number;
//   classId: number;
//   createdById: number;
//   createdAt: string;
//   updatedAt: string;
//   objective: IObjective | null;
//   anahote: IAnahote | null;
//   srijonshil: ISrijonshil | null;
//   class?: { id: number; name: string; createdAt: string; updatedAt: string };
//   subject?: {
//     id: number;
//     name: string;
//     classId: number;
//     createdAt: string;
//     updatedAt: string;
//   };
//   chapter?: {
//     id: number;
//     name: string;
//     classId: number;
//     subjectId: number;
//     createdAt: string;
//     updatedAt: string;
//   };
//   createdBy?: {
//     id: number;
//     name: string;
//     email: string;
//     role: string;
//     createdAt: string;
//     updatedAt: string;
//   };
// }

// interface IQuestionHeader {
//   id: number;
//   schoolName: string;
//   location: string;
//   className: string;
//   subject: string;
//   examType: string;
//   duration: string;
//   fullMark: number;
//   remark?: string;
// }

// // ─── Component ─────────────────────────────────────────────────────────────
// export default function ManageQuestions() {
//   // ─── Data Fetching ───────────────────────────────────────────────────────
//   const { data: questionsRes, isLoading: qLoading } = useGetAllQuestionsQuery();
//   const { data: headersRes } = useGetAllHeadersQuery();
//   const { data: classesRes, isLoading: classesLoading } = useGetAllClassesQuery(
//     { page: 1, limit: 100 },
//   );
//   const { data: subjectsRes, isLoading: subjectsLoading } = useGetAllSubjectsQuery();
//   const { data: chaptersRes, isLoading: chaptersLoading } = useGetAllChaptersQuery();

//   const allQuestions = questionsRes?.data ?? [];
//   const savedHeaders = headersRes?.data ?? [];
//   const allClasses = classesRes?.data ?? [];
//   const allSubjects = subjectsRes?.data ?? [];
//   const allChapters = chaptersRes?.data ?? [];

//   // ─── State ────────────────────────────────────────────────────────────────
//   const [selectedQuestions, setSelectedQuestions] = useState<IQuestion[]>([]);
//   const [selectedHeader, setSelectedHeader] = useState<IQuestionHeader | null>(null);
//   const [selectedClassId, setSelectedClassId] = useState<string>("all");
//   const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
//   const [selectedChapterId, setSelectedChapterId] = useState<string>("all");
//   const [selectedType, setSelectedType] = useState<"OBJECTIVE" | "ANAHOTE" | "SRIJONSHIL" | "all">("all");

//   const [header, setHeader] = useState({
//     schoolName: "",
//     location: "",
//     className: "",
//     subject: "",
//     examType: "",
//     duration: "",
//     fullMark: "",
//     remark: "",
//   });

//   // ─── Derived filtered dropdown data ──────────────────────────────────────
//   const filteredSubjects = allSubjects.filter(
//     (s) => selectedClassId === "all" || s.classId === Number(selectedClassId),
//   );

//   const filteredChapters = allChapters.filter(
//     (ch) =>
//       (selectedSubjectId === "all" || ch.subjectId === Number(selectedSubjectId)) &&
//       (selectedClassId === "all" || ch.classId === Number(selectedClassId)),
//   );

//   // ─── Filtered questions ───────────────────────────────────────────────────
//   const filteredQuestions = allQuestions.filter((q) => {
//     if (selectedClassId !== "all" && q.classId !== Number(selectedClassId)) return false;
//     if (selectedSubjectId !== "all" && q.subjectId !== Number(selectedSubjectId)) return false;
//     if (selectedChapterId !== "all" && q.chapterId !== Number(selectedChapterId)) return false;
//     if (selectedType !== "all" && q.type !== selectedType) return false;
//     return true;
//   });

//   // ─── Header sync ──────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (selectedHeader) {
//       setHeader({
//         schoolName: selectedHeader.schoolName,
//         location: selectedHeader.location,
//         className: selectedHeader.className,
//         subject: selectedHeader.subject,
//         examType: selectedHeader.examType,
//         duration: selectedHeader.duration,
//         fullMark: String(selectedHeader.fullMark),
//         remark: selectedHeader.remark || "",
//       });
//     }
//   }, [selectedHeader]);

//   // ─── Helpers ──────────────────────────────────────────────────────────────
//   const getQuestionPreview = (q: IQuestion): string => {
//     if (q.type === "SRIJONSHIL" && q.srijonshil) {
//       return (q.srijonshil.prompt?.slice(0, 80) ?? "") + "...";
//     }
//     if (q.type === "OBJECTIVE" && q.objective) {
//       return (q.objective.questionText?.slice(0, 80) ?? "") + "...";
//     }
//     if (q.type === "ANAHOTE" && q.anahote) {
//       return (q.anahote.questionText?.slice(0, 80) ?? "") + "...";
//     }
//     return "No preview available";
//   };

//   // ─── Generators ───────────────────────────────────────────────────────────
//   const generatePDF = () => {
//     if (selectedQuestions.length === 0) {
//       alert("Please select at least one question");
//       return;
//     }

//     // Setup font for Bangla
//     pdfMake.vfs = { ...pdfFonts.pdfMake.vfs, ...banglaFonts };
//     pdfMake.fonts = {
//       SolaimanLipi: {
//         normal: 'SolaimanLipi.ttf',
//         bold: 'SolaimanLipi-Bold.ttf',
//       },
//     };

//     const content = [
//       { text: header.schoolName || "School Name", style: 'schoolName' },
//       { text: `${selectedType} Question Paper` || "Question Paper", style: 'type' },
//       { text: `${header.examType || "Examination"} | Class: ${header.className || ""} | Subject: ${header.subject || ""}`, style: 'details' },
//       { text: `Time: ${header.duration || ""} | Full Marks: ${header.fullMark || ""}`, style: 'details' },
//       { text: header.remark || "", style: 'remark' },
//     ];

//     selectedQuestions.forEach((q, i) => {
//       const mainText =
//         q.type === "SRIJONSHIL" ? q.srijonshil?.prompt :
//         q.type === "OBJECTIVE" ? q.objective?.questionText :
//         q.anahote?.questionText || "";

//       content.push({ text: `${i + 1}. ${mainText}`, style: 'question' });

//       if (q.type === "SRIJONSHIL" && q.srijonshil) {
//         q.srijonshil.subQuestions.forEach((sq, idx) => {
//           content.push({ text: `(${String.fromCharCode(97 + idx)}) ${sq.questionText} [${sq.questionMark}]`, style: 'subQuestion' });
//         });
//       } else if (q.type === "OBJECTIVE" && q.objective) {
//         const optionsTable = {
//           table: {
//             widths: ['*', '*'],
//             body: [
//               [`a. ${q.objective.options[0]?.text || ""}`, `b. ${q.objective.options[1]?.text || ""}`],
//               [`c. ${q.objective.options[2]?.text || ""}`, `d. ${q.objective.options[3]?.text || ""}`],
//             ],
//           },
//           layout: 'noBorders',
//           margin: [0, 5, 0, 10],
//         };
//         content.push(optionsTable);
//       } else if (q.type === "ANAHOTE" && q.anahote) {
//         content.push({ text: `[Marks: ${q.anahote.questionMark}]`, style: 'marks' });
//       }
//     });

//     const docDefinition = {
//       content,
//       defaultStyle: { font: "SolaimanLipi" },
//       styles: {
//         schoolName: { fontSize: 16, bold: true, alignment: "center", margin: [0, 0, 0, 5] },
//         type: { fontSize: 14, bold: true, alignment: "center", margin: [0, 0, 0, 5] },
//         details: { fontSize: 12, alignment: "center", margin: [0, 0, 0, 5] },
//         remark: { fontSize: 10, italics: true, alignment: "center", margin: [0, 0, 0, 20] },
//         question: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
//         subQuestion: { fontSize: 12, margin: [10, 5, 0, 5] },
//         marks: { fontSize: 10, italics: true, margin: [10, 5, 0, 10] },
//       },
//     };

//     pdfMake.createPdf(docDefinition).download(`${selectedType || "question"}-paper.pdf`);
//   };

//   const generateDOCX = async () => {
//     if (selectedQuestions.length === 0) {
//       alert("Please select at least one question");
//       return;
//     }

//     const children = [
//       new Paragraph({ text: header.schoolName || "School Name", alignment: AlignmentType.CENTER, bold: true, size: 32 }),
//       new Paragraph({ text: `${selectedType} Question Paper` || "Question Paper", alignment: AlignmentType.CENTER, bold: true, size: 28 }),
//       new Paragraph({ text: `${header.examType || "Examination"} | Class: ${header.className || ""} | Subject: ${header.subject || ""}`, alignment: AlignmentType.CENTER, size: 24 }),
//       new Paragraph({ text: `Time: ${header.duration || ""} | Full Marks: ${header.fullMark || ""}`, alignment: AlignmentType.CENTER, size: 24 }),
//       new Paragraph({ text: header.remark || "", alignment: AlignmentType.CENTER, italic: true, size: 20 }),
//     ];

//     selectedQuestions.forEach((q, i) => {
//       const mainText =
//         q.type === "SRIJONSHIL" ? q.srijonshil?.prompt :
//         q.type === "OBJECTIVE" ? q.objective?.questionText :
//         q.anahote?.questionText || "";

//       children.push(
//         new Paragraph({ text: `${i + 1}. ${mainText}`, bold: true }),
//       );

//       if (q.type === "SRIJONSHIL" && q.srijonshil) {
//         q.srijonshil.subQuestions.forEach((sq, idx) => {
//           children.push(
//             new Paragraph({
//               text: `(${String.fromCharCode(97 + idx)}) ${sq.questionText} [${sq.questionMark}]`,
//               indent: { left: 720 },
//             }),
//           );
//         });
//       } else if (q.type === "OBJECTIVE" && q.objective) {
//         const table = new Table({
//           rows: [
//             new TableRow({
//               children: [
//                 new TableCell({ content: new Paragraph(`a. ${q.objective.options[0]?.text || ""}`), borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE } }),
//                 new TableCell({ content: new Paragraph(`b. ${q.objective.options[1]?.text || ""}`), borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE } }),
//               ],
//             }),
//             new TableRow({
//               children: [
//                 new TableCell({ content: new Paragraph(`c. ${q.objective.options[2]?.text || ""}`), borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE } }),
//                 new TableCell({ content: new Paragraph(`d. ${q.objective.options[3]?.text || ""}`), borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE } }),
//               ],
//             }),
//           ],
//           width: { size: 100, type: WidthType.PERCENTAGE },
//         });
//         children.push(table);
//       } else if (q.type === "ANAHOTE" && q.anahote) {
//         children.push(
//           new Paragraph({
//             text: `[Marks: ${q.anahote.questionMark}]`,
//             italic: true,
//             indent: { left: 720 },
//           }),
//         );
//       }
//     });

//     const doc = new Document({ sections: [{ children }] });
//     const blob = await Packer.toBlob(doc);
//     saveAs(blob, `${selectedType || "question"}-paper.docx`);
//   };

//   const isLoading = qLoading || classesLoading || subjectsLoading || chaptersLoading;


