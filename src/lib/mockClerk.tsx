import React from "react";

// Mock User Data
const MOCK_USER = {
    id: "user_mocked",
    firstName: "Mock",
    lastName: "User",
    username: "mockuser",
    imageUrl: "https://via.placeholder.com/150",
    emailAddresses: [{ emailAddress: "mock@example.com" }],
    publicMetadata: {},
};

// Mock useUser hook
export const useUser = () => {
    return {
        isSignedIn: true,
        user: MOCK_USER,
        isLoaded: true,
    };
};

// Mock useAuth hook
export const useAuth = () => {
    return {
        isSignedIn: true,
        userId: MOCK_USER.id,
        sessionId: "session_mock",
        getToken: async () => "token_mock",
        isLoaded: true,
    };
};

// Mock SignInButton component
export const SignInButton = ({ children, ...props }: any) => {
    return <div onClick={() => alert("Sign In Clicked (Mock)")} {...props}>{children}</div>;
};

// Mock SignUpButton component
export const SignUpButton = ({ children, ...props }: any) => {
    return <div onClick={() => alert("Sign Up Clicked (Mock)")} {...props}>{children}</div>;
};

// Mock UserButton component
export const UserButton = (props: any) => {
    return <div className="h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center text-xs" {...props}>M</div>;
};

// Mock ClerkProvider component
export const ClerkProvider = ({ children, ...props }: any) => {
    return <>{children}</>;
};
