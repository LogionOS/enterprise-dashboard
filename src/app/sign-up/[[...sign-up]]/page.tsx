import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign up -- LogionOS",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
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
