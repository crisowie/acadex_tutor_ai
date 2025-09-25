import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-screen">
          {/* Top bar - Fixed height */}
          <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="logo flex gap-2 items-center md:hidden">
              <img src="/logo.png" alt="" width={120} />
            </div>
          </header>

          {/* Main content - Takes remaining height */}
          <main className="flex-1 min-h-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}