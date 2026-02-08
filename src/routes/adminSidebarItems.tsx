import {
  School,
  BookOpen,
  Layers,
  UserCheck,
  ClipboardList,
  FileQuestion,
} from "lucide-react";

import type { ISidebarItem } from "@/type";
import AddClass from "@/pages/Admin/AddClass";
import AddSubject from "@/pages/Admin/AddSubject";
import AddChapter from "@/pages/Admin/AddChapter";
import TeacherSubjectAssign from "@/pages/Admin/TeacherSubjectAssign";
import AddQuestionHeader from "@/pages/Admin/AddQuestionHeader";
import AddQuestion from "@/pages/Admin/ManageQuestions";
import ManageUsers from "@/pages/Admin/ManageUsers";

export const adminSidebarItems: ISidebarItem[] = [
  {
    title: "Question Management",
    items: [
      {
        title: "Add Class",
        url: "/admin/add-class",
        icon: School,
        component: AddClass,
      },
      {
        title: "Add Subject",
        url: "/admin/add-subject",
        icon: BookOpen,
        component: AddSubject,
      },
      {
        title: "Add Chapter",
        url: "/admin/add-chapter",
        icon: Layers,
        component: AddChapter,
      },
      {
        title: "Teacher Assignment",
        url: "/admin/teacher-assignment",
        icon: UserCheck,
        component: TeacherSubjectAssign,
      },
      {
        title: "Question Header",
        url: "/admin/question-header",
        icon: ClipboardList,
        component: AddQuestionHeader,
      },
      {
        title: "Manage Question",
        url: "/admin/add-question",
        icon: FileQuestion,
        component: AddQuestion,
      },
    ],
  },
  {
    title: "Users Management",
    items: [
      {
        title: "Manage Users",
        url: "/admin/manage-users",
        icon: UserCheck,
        component: ManageUsers,
      },
    ],
  },
];
