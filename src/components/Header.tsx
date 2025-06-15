
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Calendar, User, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock auth state - replace with actual auth context
  const isAuthenticated = false;
  const notifications = 3;

  const navigationItems = [
    { name: "Browse Events", href: "/browse", icon: Search },
    { name: "Create Event", href: "/create-event", icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EventHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth/User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/auth">
                  <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6 transition-all duration-300 hover:scale-105">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                      {notifications}
                    </Badge>
                  )}
                </Button>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-6 mt-6">
                <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EventHub
                  </span>
                </Link>
                
                <nav className="flex flex-col space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>

                {!isAuthenticated ? (
                  <div className="flex flex-col space-y-3 pt-6 border-t">
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3 pt-6 border-t">
                    <Button variant="ghost" className="justify-start">
                      <Bell className="w-5 h-5 mr-3" />
                      Notifications
                      {notifications > 0 && (
                        <Badge className="ml-auto bg-red-500 text-white">
                          {notifications}
                        </Badge>
                      )}
                    </Button>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="w-5 h-5 mr-3" />
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
