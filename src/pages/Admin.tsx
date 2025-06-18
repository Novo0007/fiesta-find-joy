
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminPanel from "@/components/AdminPanel";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

const Admin = () => {
  return (
    <RoleProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
            <AdminPanel />
          </div>
        </main>
      </div>
    </RoleProtectedRoute>
  );
};

export default Admin;
