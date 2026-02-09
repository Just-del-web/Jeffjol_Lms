import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout"; 
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Signup";
import VerifyOtp from "./pages/auth/VerifyOtp";
import { Toaster } from "sonner";

// Page Imports
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/Users";
import PaymentApprovals from "./pages/admin/PaymentApprovals";
import SchoolBroadcast from "./pages/admin/Broadcast";
import Noticeboard from "./pages/admin/Noticeboard";
import ParentDashboard from "./pages/parents/Dashboard";
import ChildResults from "./pages/parents/ChildResults";
import FamilyBursary from "./pages/parents/FamilyBusary";
import StudentDashboard from "./pages/student/Dashboard";
import StudentExams from "./pages/student/Exam";
import SubjectLibrary from "./pages/student/Library";
import NoteReader from "./pages/student/NoteReader";
import StudentPayment from "./pages/student/Payment";
import StudentResults from "./pages/student/Results";
import ClassAnalytics from "./pages/teachers/Analytics";
import ContentManager from "./pages/teachers/ContentManager";
import GradeEntry from "./pages/teachers/GradeEntry";
import QuestionBank from "./pages/teachers/QuestionBank";
import ScheduleExam from "./pages/teachers/ScheduleExam";

export default function App() {
  const role = localStorage.getItem("role") || "admin"; 

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />



        {/* This is the magic part: DashboardLayout wraps everything */}
        <Route element={<DashboardLayout />}>
          {/* ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/approvals" element={<PaymentApprovals />} />
          <Route path="/admin/broadcast" element={<SchoolBroadcast />} />
          <Route path="/admin/noticeboard" element={<Noticeboard />} />

          {/* PARENT */}
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/results" element={<ChildResults />} />
          <Route path="/parent/bursary" element={<FamilyBursary />} />

          {/* STUDENT */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/library" element={<SubjectLibrary />} />
          <Route path="/student/results" element={<StudentResults />} />
          <Route path="/student/payments" element={<StudentPayment />} />
          <Route path="/student/exams" element={<StudentExams />} />
          <Route path="/student/notes" element={<NoteReader />} />
          <Route path="/student/analytics" element={<ClassAnalytics />} />

          {/* TEACHER */}
          <Route path="/teacher" element={<ClassAnalytics />} />
          <Route path="/teacher/grades" element={<GradeEntry />} />
          <Route path="/teacher/content" element={<ContentManager />} />
          <Route path="/teacher/questions" element={<QuestionBank />} />
          <Route path="/teacher/schedule" element={<ScheduleExam />} />
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to={`/${role}`} />} />
      </Routes>
    </BrowserRouter>
  );
}