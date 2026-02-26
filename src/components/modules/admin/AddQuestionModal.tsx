"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import ObjectiveQuestionForm from "./ObjectiveQuestionForm";
import AnahoteQuestionForm from "./AnahoteQuestionForm";
import SrijonshilQuestionForm from "./SrijonshilQuestionForm";

/* ============================= */
/* ✅ Types */
/* ============================= */

export interface IClass {
  id: number;
  name: string;
}

export interface ISubject {
  id: number;
  name: string;
  classId: number;
}

export interface IChapter {
  id: number;
  name: string;
  classId: number;
  subjectId: number;
}

interface AddQuestionModalProps {
  classes: IClass[];
  subjects: ISubject[];
  chapters: IChapter[];
}

/* ============================= */
/* ✅ Component */
/* ============================= */

export default function AddQuestionModal({
  classes,
  subjects,
  chapters,
}: AddQuestionModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Question</Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="OBJECTIVE" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="OBJECTIVE">Objective</TabsTrigger>
            <TabsTrigger value="ANAHOTE">Anahote</TabsTrigger>
            <TabsTrigger value="SRIJONSHIL">Srijonshil</TabsTrigger>
          </TabsList>

          {/* ============================= */}
          {/* Objective */}
          {/* ============================= */}
          <TabsContent value="OBJECTIVE">
            <ObjectiveQuestionForm
              closeModal={() => setOpen(false)}
              classes={classes}
              subjects={subjects}
              chapters={chapters}
            />
          </TabsContent>

          {/* ============================= */}
          {/* Anahote */}
          {/* ============================= */}
          <TabsContent value="ANAHOTE">
            <AnahoteQuestionForm
              closeModal={() => setOpen(false)}
              classes={classes}
              subjects={subjects}
              chapters={chapters}
            />
          </TabsContent>

          {/* ============================= */}
          {/* Srijonshil */}
          {/* ============================= */}
          <TabsContent value="SRIJONSHIL">
            <SrijonshilQuestionForm
              closeModal={() => setOpen(false)}
              classes={classes}
              subjects={subjects}
              chapters={chapters}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
