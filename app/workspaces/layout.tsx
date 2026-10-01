import { AppHeader } from "@/components/AppHeader";

export default function WorkspacesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
