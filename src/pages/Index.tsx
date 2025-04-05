
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { LoanDashboard } from "@/components/dashboard/LoanDashboard";
import { GlobalProvider } from "@/context/GlobalContext";

const Index = () => {
  return (
    <GlobalProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-slate-50">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
              <SidebarTrigger />
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-white font-medium mr-2">
                  JD
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <LoanDashboard />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </GlobalProvider>
  );
};

export default Index;
