import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign in -- LogionOS",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        appearance={{
          variables: {
            colorPrimary: "#6366f1",
            colorBackground: "#09090b",
            colorText: "#e4e4e7",
            colorInputBackground: "#18181b",
            colorInputText: "#fafafa",
          },
          elements: {
            card: "shadow-none border border-zinc-800",
          },
        }}
      />
    </div>
  );
}
