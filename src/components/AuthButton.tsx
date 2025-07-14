'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { LogIn } from 'lucide-react';

export const AuthButton = () => {
  return (
    <div className="flex items-center space-x-3">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <LogIn className="h-4 w-4" />
            <span>Sign in</span>
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
              userButtonPopoverCard: "shadow-lg border",
              userButtonPopoverActionButton: "hover:bg-gray-100 dark:hover:bg-gray-800"
            }
          }}
        />
      </SignedIn>
    </div>
  );
}; 