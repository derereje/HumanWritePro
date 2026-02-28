import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center p-4 md:p-6" data-analytics-id="sign-up-page-container">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl",
          },
        }}
      />
    </main>
  );
}
