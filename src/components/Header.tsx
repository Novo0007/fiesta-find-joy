
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User, LogOut, Plus, Ticket, Shield, QrCode, Newspaper } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const { userRole, canManageEvents, isAdmin } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          <Calendar className="w-8 h-8 text-blue-600" />
          <span>EventHub</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/browse" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Browse Events
          </Link>
          <Link 
            to="/hackernews" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Hacker News
          </Link>
          {user && (
            <Link 
              to="/my-bookings" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              My Bookings
            </Link>
          )}
          {canManageEvents && (
            <>
              <Link 
                to="/create-event" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Create Event
              </Link>
              <Link 
                to="/validate-ticket" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Validate Tickets
              </Link>
            </>
          )}
          {isAdmin && (
            <Link 
              to="/admin" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {getUserInitials(user.email || "")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {userRole} account
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-bookings" className="cursor-pointer">
                    <Ticket className="mr-2 h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                {canManageEvents && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/create-event" className="cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/validate-ticket" className="cursor-pointer">
                        <QrCode className="mr-2 h-4 w-4" />
                        Validate Tickets
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
