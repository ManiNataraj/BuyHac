"use client";

import React, { useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import  AuthModal  from "./AuthModal";
import { signOut } from "@/app/auth/callback/actions";

const AuthButton = ({ user }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (user) {
    return (
      <form action={ signOut }>
        <Button variant="ghost" size="sm" className="bg-orange-500 gap-2">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </form>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowAuthModal(true)}
        variant="default"
        size="sm"
        className="bg-orange-600 gap-2"
      >
        <LogIn className="w-4 h-4" /> Sign In
      </Button>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
};

export default AuthButton;