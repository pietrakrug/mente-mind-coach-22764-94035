import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Calendar, BarChart3, Beaker, Gift, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Histórico', href: '/history', icon: Calendar },
  { name: 'Testes', href: '/tests', icon: Beaker },
  { name: 'Frase', href: '/daily-quote', icon: Gift },
  { name: 'Dicas', href: '/tips', icon: BookOpen },
  { name: 'Perfil', href: '/profile', icon: User },
];

const MobileNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-5 w-5 mb-1', isActive && 'animate-scale-in')} />
                <span className="text-xs font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
