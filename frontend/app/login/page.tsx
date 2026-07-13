import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-6 py-10">
      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold text-dark-navy dark:text-foreground">Log in</h1>
        <p className="text-sm text-gray-text">Enter any email and password to continue.</p>
      </header>
      <LoginForm />
    </div>
  );
}
