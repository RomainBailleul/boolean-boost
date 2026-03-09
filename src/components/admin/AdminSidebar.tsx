import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BarChart3, Users, ScrollText, ArrowLeft } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const items = [
  { title: 'Dashboard', url: '/admin', icon: BarChart3 },
  { title: 'Utilisateurs', url: '/admin/users', icon: Users },
  { title: 'Logs', url: '/admin/logs', icon: ScrollText },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const isActive = (url: string) =>
    url === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" size="sm" asChild className="w-full justify-start">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {!collapsed && 'Retour au site'}
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
