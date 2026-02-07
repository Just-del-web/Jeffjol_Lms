import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/Login";
// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/Users";
import PaymentApprovals from "./pages/admin/PaymentApprovals";
import MailCenter from "./pages/admin/MailCenter";
import Noticeboard from "./pages/admin/Noticeboard";
import ChildResults from "./pages/parents/ChildResults";
import FamilyBursary from "./pages/parents/FamilyBusary";
import ParentDashboard from "./pages/parents/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import StudentExams from "./pages/student/Exam";
import SubjectLibrary from "./pages/student/Library";
import NoteReader from "./pages/student/NoteReader";
import ClassAnalytics from "./pages/teachers/Analytics";
import StudentPayment from "./pages/student/Payment";
import StudentResults from "./pages/student/Results";
import ContentManager from "./pages/teacher/ContentManager";
import GradeEntry from "./pages/teacher/GradeEntry";
import QuestionBank from "./pages/teacher/QuestionBank";
import ScheduleExam from "./pages/teacher/ScheduleExam";

export default function App() {
  const user = { role: localStorage.getItem("role") };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* PROTECTED LAYOUT */}
        <Route
          path="/*"
          element={
            <div className="flex min-h-screen bg-background">
              <Sidebar role={user.role} />
              <main className="flex-1 p-4 lg:p-10 pt-20 lg:pt-10 w-full max-w-7xl mx-auto">
                <Routes>
                  {/* ADMIN ROUTES */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route
                    path="/admin/approvals"
                    element={<PaymentApprovals />}
                  />
                  <Route path="/admin/mail" element={<MailCenter />} />
                  <Route path="/admin/noticeboard" element={<Noticeboard />} />

                  {/* PARENTS ROUTES */}
                  <Route
                    path="/parent/dashboard"
                    element={<ParentDashboard />}
                  />
                  <Route path="/parent/results" element={<ChildResults />} />
                  <Route path="/parent/bursary" element={<FamilyBursary />} />

                  {/* STUDENT ROUTES */}
                  <Route
                    path="/student/dashboard"
                    element={<StudentDashboard />}
                  />
                  <Route path="/student/exams" element={<StudentExams />} />
                  <Route path="/student/library" element={<SubjectLibrary />} />
                  <Route path="/student/notes" element={<NoteReader />} />
                  <Route
                    path="/student/analytics"
                    element={<ClassAnalytics />}
                  />
                  <Route path="/student/payment" element={<StudentPayment />} />
                  <Route path="/student/results" element={<StudentResults />} />

                  {/* TEACHERS ROUTES */}
                  <Route path="/teacher/content" element={<ContentManager />} />
                  <Route path="/teacher/grade" element={<GradeEntry />} />
                  <Route path="/teacher/questions" element={<QuestionBank />} />
                  <Route path="/teacher/schedule" element={<ScheduleExam />} />

                  <Route path="/" element={<Navigate to={`/${user.role}`} />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
