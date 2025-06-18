
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import TicketValidation from "@/components/TicketValidation";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

const ValidateTicket = () => {
  return (
    <RoleProtectedRoute requireManageEvents>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Ticket Validation</h1>
            <TicketValidation />
          </div>
        </main>
      </div>
    </RoleProtectedRoute>
  );
};

export default ValidateTicket;
