import React from 'react';
import { StudentProfile } from '../types/placement';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAddModal: () => void;
  profile: StudentProfile;
  applicationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
  profile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'applications', label: 'Applications' },
    { id: 'diagnosis', label: 'Diagnosis' },
    { id: 'experiments', label: 'Experiments' },
    { id: 'cohort', label: 'Cohort' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#051424]/90 backdrop-blur-md border-b border-[#273647]">
      <div className="h-16 w-full px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8083ff] to-[#7bd0ff] flex items-center justify-center text-[#051424] font-bold shadow-md shadow-[#8083ff]/20">
              <span className="material-symbols-outlined text-[20px] text-white">insights</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-[#d4e4fa] tracking-tight group-hover:text-white transition-colors">
                PlaceTrace
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#1c2b3c] text-[#7bd0ff] border border-[#464554] uppercase tracking-wider">
                Telemetry Beta
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#122131] text-[#c0c1ff] shadow-sm'
                    : 'text-[#c7c4d7] hover:bg-[#122131]/60 hover:text-[#d4e4fa]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8083ff] text-[#0d0096] font-semibold text-xs hover:bg-[#c0c1ff] hover:text-[#1000a9] transition-all duration-150 shadow-md shadow-[#8083ff]/20 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Quick Notification indicator */}
          <button
            onClick={() => onTabChange('diagnosis')}
            title="Empirical alerts"
            className="p-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#1c2b3c] hover:text-[#d4e4fa] transition-colors relative"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab] absolute top-1.5 right-1.5 ring-2 ring-[#051424]"></span>
          </button>

          {/* Profile Badge */}
          <button
            onClick={() => onTabChange('profile')}
            className={`flex items-center gap-2 pl-1 py-1 pr-2.5 rounded-full bg-[#0d1c2d] border transition-colors cursor-pointer ${
              currentTab === 'profile' ? 'border-[#8083ff]' : 'border-[#273647] hover:border-[#464554]'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#c0c1ff] flex items-center justify-center shrink-0 text-[#1000a9]">
              <span className="material-symbols-outlined text-[16px]">person</span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#d4e4fa] leading-none">
                {profile.name}
              </span>
              <span className="text-[10px] text-[#c7c4d7] leading-none mt-0.5">
                {profile.branch.split(' ')[0]} {profile.graduationYear.replace('Class of ', '')}
              </span>
            </div>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-[#c7c4d7] hover:bg-[#1c2b3c]"
            type="button"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d1c2d] border-b border-[#273647] px-4 py-3 flex flex-col gap-1.5 animate-in fade-in">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentTab === item.id
                  ? 'bg-[#122131] text-[#c0c1ff]'
                  : 'text-[#c7c4d7] hover:bg-[#122131]/60 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
