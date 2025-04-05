
import { 
  BarChart2, 
  CreditCard, 
  FileText, 
  Home, 
  MessageSquare, 
  Settings, 
  User 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useGlobalState } from "@/context/GlobalContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const { state } = useGlobalState();
  const user = state.user;

  // Menu items with active state check
  const items = [
    {
      title: "Dashboard",
      icon: Home,
      url: "#",
      active: true,
    },
    {
      title: "Applications",
      icon: FileText,
      url: "#",
      active: false,
    },
    {
      title: "Customers",
      icon: User,
      url: "#",
      active: false,
    },
    {
      title: "Communications",
      icon: MessageSquare,
      url: "#",
      active: false,
      badge: 3,
    },
    {
      title: "Payments",
      icon: CreditCard,
      url: "#",
      active: false,
    },
    {
      title: "Reports",
      icon: BarChart2,
      url: "#",
      active: false,
    },
    {
      title: "Settings",
      icon: Settings,
      url: "#",
      active: false,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="py-4 flex justify-center">
          <h1 className="font-bold text-xl text-white">LoanFlow</h1>
        </div>
        
        <SidebarGroup>
          <div className="mx-3 mb-4 p-3 bg-sidebar-accent rounded-lg">
            <div className="flex items-center gap-x-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                {user?.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs bg-primary-600 text-white">
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={cn("relative", item.active && "bg-sidebar-accent")}>
                    <a href={item.url} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge className="ml-auto bg-primary-500 hover:bg-primary-600">{item.badge}</Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="mt-auto mx-3 mb-4">
          <div className="p-3 bg-sidebar-accent rounded-lg">
            <div className="flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium">Need help?</p>
                <p className="text-xs opacity-70">Contact support</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
