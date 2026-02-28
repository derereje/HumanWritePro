import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center p-4 md:p-6" data-analytics-id="sign-in-page-container">
      <SignIn
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
