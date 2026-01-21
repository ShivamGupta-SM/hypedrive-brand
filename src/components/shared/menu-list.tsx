/**
 * Menu List Components
 * iOS-style grouped menu patterns for settings and navigation
 * Ported from hypedrive-shopper for UI consistency
 */

import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { Badge } from "@/components/badge";

// =============================================================================
// DUOTONE COLOR PRESETS
// =============================================================================

export const duotoneColors = {
  sky: { bg: "bg-sky-100 dark:bg-sky-900/40", icon: "text-sky-600 dark:text-sky-400" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/40", icon: "text-orange-600 dark:text-orange-400" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/40", icon: "text-emerald-600 dark:text-emerald-400" },
  red: { bg: "bg-red-100 dark:bg-red-900/40", icon: "text-red-600 dark:text-red-400" },
  amber: { bg: "bg-amber-100 dark:bg-amber-900/40", icon: "text-amber-600 dark:text-amber-400" },
  zinc: { bg: "bg-zinc-100 dark:bg-zinc-800", icon: "text-zinc-500 dark:text-zinc-400" },
  lime: { bg: "bg-lime-100 dark:bg-lime-900/40", icon: "text-lime-600 dark:text-lime-400" },
  violet: { bg: "bg-violet-100 dark:bg-violet-900/40", icon: "text-violet-600 dark:text-violet-400" },
} as const;

export type DuotoneColor = keyof typeof duotoneColors;

// =============================================================================
// MENU SECTION
// =============================================================================

export interface MenuSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function MenuSection({ children, className }: MenuSectionProps) {
  return (
    <div className={`overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 ${className ?? ""}`}>
      {children}
    </div>
  );
}

// =============================================================================
// MENU SECTION HEADER
// =============================================================================

export interface MenuSectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function MenuSectionHeader({ children, className }: MenuSectionHeaderProps) {
  return (
    <h3 className={`mb-2 px-4 text-[13px] font-normal uppercase tracking-wide text-zinc-500 dark:text-zinc-400 ${className ?? ""}`}>
      {children}
    </h3>
  );
}

// =============================================================================
// MENU SECTION FOOTER
// =============================================================================

export interface MenuSectionFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function MenuSectionFooter({ children, className }: MenuSectionFooterProps) {
  return (
    <p className={`mt-2 px-4 text-[13px] text-zinc-500 dark:text-zinc-400 ${className ?? ""}`}>
      {children}
    </p>
  );
}

// =============================================================================
// MENU SEPARATOR
// =============================================================================

export function MenuSeparator() {
  return <div className="ml-16 h-px bg-zinc-200 dark:bg-zinc-700" />;
}

// =============================================================================
// MENU ROW
// =============================================================================

export interface MenuRowProps {
  icon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: DuotoneColor;
  label: string;
  value?: string;
  badge?: string;
  badgeColor?: "emerald" | "amber" | "red" | "zinc" | "sky" | "lime";
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  children?: React.ReactNode;
}

export function MenuRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  badge,
  badgeColor,
  onClick,
  href,
  destructive,
  isFirst,
  isLast,
  children,
}: MenuRowProps) {
  const Component = href ? "a" : onClick ? "button" : "div";
  const isInteractive = onClick || href;

  const useDuotone = iconColor && duotoneColors[iconColor];
  const containerClasses = useDuotone
    ? `flex size-9 shrink-0 items-center justify-center rounded-xl ${duotoneColors[iconColor].bg}`
    : `flex size-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`;
  const iconClasses = useDuotone
    ? `size-4 ${duotoneColors[iconColor].icon}`
    : "size-4 text-white";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      href={href}
      className={`flex w-full items-center gap-3 bg-white px-4 py-3 text-left ${
        isInteractive ? "active:bg-zinc-100 dark:active:bg-zinc-800" : ""
      } dark:bg-zinc-900 ${isFirst ? "rounded-t-xl" : ""} ${
        isLast ? "rounded-b-xl" : ""
      }`}
    >
      <div className={containerClasses}>
        <Icon className={iconClasses} />
      </div>
      <span
        className={`shrink-0 text-[15px] ${
          destructive ? "text-red-500" : "text-zinc-900 dark:text-white"
        }`}
      >
        {label}
      </span>
      {children && <div className="min-w-0 flex-1">{children}</div>}
      {value && !children && (
        <span className="min-w-0 flex-1 truncate text-right text-[15px] text-zinc-400 dark:text-zinc-500">
          {value}
        </span>
      )}
      {badge && (
        <Badge color={badgeColor || "zinc"} className="shrink-0 text-[11px]">
          {badge}
        </Badge>
      )}
      {isInteractive && !destructive && (
        <ChevronRightIcon className="size-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
      )}
    </Component>
  );
}

// =============================================================================
// MENU ACTION BUTTON
// =============================================================================

export interface MenuActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  color?: "sky" | "emerald" | "amber" | "red" | "zinc" | "lime";
  isFirst?: boolean;
  isLast?: boolean;
}

export function MenuActionButton({
  children,
  onClick,
  color = "sky",
  isFirst,
  isLast = true,
}: MenuActionButtonProps) {
  const colorClasses = {
    sky: "text-sky-600 dark:text-sky-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    zinc: "text-zinc-600 dark:text-zinc-400",
    lime: "text-lime-600 dark:text-lime-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 bg-white py-3 text-[15px] font-medium active:bg-zinc-50 dark:bg-zinc-900 dark:active:bg-zinc-800 ${
        colorClasses[color]
      } ${isFirst ? "rounded-t-xl" : ""} ${isLast ? "rounded-b-xl" : ""}`}
    >
      {children}
    </button>
  );
}

// =============================================================================
// MENU DANGER BUTTON
// =============================================================================

export interface MenuDangerButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export function MenuDangerButton({ children, onClick }: MenuDangerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-[15px] font-medium text-red-500 shadow-sm ring-1 ring-zinc-200 active:bg-zinc-50 dark:bg-zinc-900 dark:ring-zinc-800 dark:active:bg-zinc-800"
    >
      {children}
    </button>
  );
}

// =============================================================================
// MENU TOGGLE ROW
// =============================================================================

export interface MenuToggleRowProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: DuotoneColor;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function MenuToggleRow({
  icon: Icon,
  iconColor = "zinc",
  label,
  description,
  checked,
  onChange,
  isFirst,
  isLast,
}: MenuToggleRowProps) {
  const colors = duotoneColors[iconColor];

  return (
    <div
      className={`flex w-full items-center gap-3 bg-white px-4 py-3 dark:bg-zinc-900 ${
        isFirst ? "rounded-t-xl" : ""
      } ${isLast ? "rounded-b-xl" : ""}`}
    >
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${colors.bg}`}>
        <Icon className={`size-4 ${colors.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[15px] text-zinc-900 dark:text-white">{label}</span>
        {description && (
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
          checked ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </div>
  );
}

// =============================================================================
// PROFILE CARD
// =============================================================================

export interface ProfileCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  coverUrl?: string;
  stats?: Array<{ label: string; value: string | number }>;
  onEditProfile?: () => void;
  onEditAvatar?: () => void;
}

export function ProfileCard({
  name,
  email,
  avatarUrl,
  coverUrl,
  stats,
  onEditProfile,
  onEditAvatar,
}: ProfileCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      {/* Cover */}
      <div className="relative h-24 bg-gradient-to-br from-emerald-400 to-emerald-600">
        {coverUrl && (
          <img src={coverUrl} alt="" className="size-full object-cover" />
        )}
      </div>

      {/* Avatar */}
      <div className="relative px-4 pb-4">
        <div className="-mt-10 flex items-end gap-4">
          <div className="relative">
            <div className="size-20 overflow-hidden rounded-2xl border-4 border-white bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-800">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-xl font-semibold text-zinc-500">
                  {initials}
                </div>
              )}
            </div>
            {onEditAvatar && (
              <button
                type="button"
                onClick={onEditAvatar}
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white dark:ring-zinc-900"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <h2 className="truncate text-lg font-semibold text-zinc-900 dark:text-white">{name}</h2>
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{email}</p>
          </div>
          {onEditProfile && (
            <button
              type="button"
              onClick={onEditProfile}
              className="mb-1 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              Edit
            </button>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="mt-4 flex divide-x divide-zinc-200 rounded-xl bg-zinc-50 dark:divide-zinc-700 dark:bg-zinc-800/50">
            {stats.map((stat) => (
              <div key={stat.label} className="flex-1 px-4 py-3 text-center">
                <div className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// THEME SELECTOR
// =============================================================================

export type ThemeOption = "light" | "dark" | "system";

export interface ThemeSelectorProps {
  value: ThemeOption;
  onChange: (value: ThemeOption) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const options: Array<{ id: ThemeOption; icon: React.ReactNode; label: string }> = [
    {
      id: "light",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ),
      label: "Light",
    },
    {
      id: "dark",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ),
      label: "Dark",
    },
    {
      id: "system",
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      ),
      label: "System",
    },
  ];

  return (
    <div className="flex gap-2 p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg py-3 transition-colors ${
            value === option.id
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "text-zinc-400 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:bg-zinc-800"
          }`}
        >
          {option.icon}
          <span className="text-xs font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
