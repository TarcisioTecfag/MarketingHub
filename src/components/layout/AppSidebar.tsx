import { MessageSquare, Smartphone, Cake, CalendarHeart, LayoutDashboard, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const whatsappItems = [
  { title: "Conexão", url: "/whatsapp/conexao", icon: Smartphone },
  { title: "Aniversariantes", url: "/whatsapp/aniversariantes", icon: Cake },
  { title: "Disparos Sazonais", url: "/whatsapp/sazonais", icon: CalendarHeart },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 flex items-center justify-center">
        <div className="flex items-center w-full gap-2 overflow-hidden">
          <img src="/logo.png" alt="Tecfag" className="h-[4.5rem] w-auto object-contain shrink-0 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:h-10 drop-shadow-sm" />
          <div className="flex flex-col justify-center whitespace-nowrap transition-all duration-300 ease-in-out group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
            <p className="text-sm font-semibold text-sidebar-accent-foreground">Tecfag</p>
            <p className="text-xs text-sidebar-foreground">Marketing Hub</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Início">
                  <NavLink to="/" end activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Início</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="WhatsApp" className="font-medium">
                    <MessageSquare className="h-4 w-4 shrink-0 border-transparent" />
                    <span>WhatsApp</span>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down group-data-[collapsible=icon]:hidden">
                  <SidebarMenu className="mt-1 pl-6">
                    {whatsappItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
