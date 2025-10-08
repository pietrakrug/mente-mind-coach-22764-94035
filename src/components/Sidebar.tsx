import { NavLink } from 'react-router-dom';
import { Brain, LayoutDashboard, User, Calendar, BarChart3, Beaker, Gift, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Histórico', href: '/history', icon: Calendar },
  { name: 'Testes', href: '/tests', icon: Beaker },
  { name: 'Frase do Dia', href: '/daily-quote', icon: Gift },
  { name: 'Dicas', href: '/tips', icon: BookOpen },
  { name: 'Perfil', href: '/profile', icon: User },
];

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-card border-r border-border">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Mente Viva</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex-shrink-0 flex border-t border-border p-4">
          <p className="text-xs text-muted-foreground">
            Building better habits, one day at a time
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
