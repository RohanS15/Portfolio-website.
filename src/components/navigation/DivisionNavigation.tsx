import { useEffect, useRef } from "react";
import { divisionRoutes, type Division } from "../../app/routes";
import { portfolio } from "../../content";
import { useTheme } from "../theme/ThemeProvider";
import SocialIcon from "../socials/SocialIcon";

const divisionLinks: Array<{ id: Division; label: string; href: string }> = [
  { id: "portfolio", label: "Portfolio", href: divisionRoutes.portfolio },
  { id: "projects", label: "Projects", href: divisionRoutes.projects },
  { id: "playground", label: "Playground", href: divisionRoutes.playground },
];

const sidebarItems: Record<Division, Array<{ label: string; href: string }>> = {
  portfolio: [
    { label: "Home", href: "#home" },
    { label: "About & context", href: "#about" },
    { label: "Skills & tools", href: "#skills" },
    { label: "Experience & direction", href: "#experience" },
    { label: "Services & automation", href: "#services" },
    { label: "Contact", href: "#contact" },
  ],
  projects: [
    { label: "All Projects", href: "#projects" },
    { label: "Categories & filters", href: "#project-filters" },
  ],
  playground: [
    { label: "Overview", href: "#explore" },
    { label: "Arcade & challenges", href: "#arcade" },
    { label: "Cyber Lab", href: "#cyber-lab" },
    { label: "Coding Playground", href: "#playground" },
    { label: "Terminal", href: "#terminal" },
    { label: "Automation Lab", href: "#automation" },
  ],
};

export function GlobalNavigation({
  division,
  sidebarOpen,
  onSidebarToggle,
}: {
  division: Division;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="global-nav" aria-label="Global navigation">
      <a
        className="global-brand"
        href={divisionRoutes.portfolio}
        aria-label="Rohan — Portfolio"
      >
        <span className="brand-mark"><img src="/images/rohan-profile.png" alt="" /></span>
        <span>
          ROHAN<span>.</span>
        </span>
      </a>
      <nav className="division-nav" aria-label="Experiences">
        {divisionLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className={division === link.id ? "active" : ""}
            aria-current={division === link.id ? "page" : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="global-social-links" aria-label="Professional profiles">
        {portfolio.githubUrl && (
          <a href={portfolio.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub profile" title="GitHub">
            <SocialIcon platform="github" />
          </a>
        )}
        {portfolio.linkedinUrl && (
          <a href={portfolio.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn profile" title="LinkedIn">
            <SocialIcon platform="linkedin" />
          </a>
        )}
      </div>
      <div className="global-nav-actions">
        <button
          type="button"
          className="global-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          <span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
        <button
          type="button"
          className="global-menu-toggle"
          aria-label={sidebarOpen ? "Close section menu" : "Open section menu"}
          aria-expanded={sidebarOpen}
          onClick={onSidebarToggle}
        >
          <span aria-hidden="true">{sidebarOpen ? "×" : "☰"}</span>
          <span className="sr-only">Section menu</span>
        </button>
      </div>
    </header>
  );
}

export function ContextualSidebar({
  division,
  open,
  active,
  onOpenChange,
  onNavigate,
}: {
  division: Division;
  open: boolean;
  active: string;
  onOpenChange: (open: boolean) => void;
  onNavigate: () => void;
}) {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panel = useRef<HTMLElement>(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => onOpenChange(false), 220);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      cancelClose();
    };
  }, [onOpenChange]);

  return (
    <>
      <button
        className={`sidebar-edge-trigger${open ? " is-open" : ""}`}
        type="button"
        aria-label="Open section navigation"
        aria-expanded={open}
        onClick={() => onOpenChange(true)}
        onFocus={() => {
          cancelClose();
          onOpenChange(true);
        }}
        onMouseEnter={() => {
          cancelClose();
          onOpenChange(true);
        }}
        onMouseLeave={scheduleClose}
      ><span className="sidebar-handle-icon" aria-hidden="true"><i/><i/><i/></span><span className="sidebar-handle-chevron" aria-hidden="true">›</span></button>
      {open && (
        <button
          className="division-sidebar-backdrop"
          type="button"
          aria-label="Close section navigation"
          onClick={() => onOpenChange(false)}
        />
      )}
      <aside
        ref={panel}
        className={`division-sidebar${open ? " is-open" : ""}`}
        aria-label={`${divisionLinks.find((item) => item.id === division)?.label} navigation`}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        onFocus={() => {
          cancelClose();
          onOpenChange(true);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            scheduleClose();
        }}
      >
        <div className="division-sidebar-heading">
          <span>{division.toUpperCase()}</span>
          <button
            type="button"
            aria-label="Close section navigation"
            onClick={() => onOpenChange(false)}
          >
            ×
          </button>
        </div>
        <nav aria-label={`${division} sections`}>
          {sidebarItems[division].map((item, index) => (
            <a
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={active === item.href.slice(1) ? "active" : ""}
              aria-current={
                active === item.href.slice(1) ? "location" : undefined
              }
              onClick={onNavigate}
            >
              <span className="division-sidebar-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item.label}</span>
              <i aria-hidden="true">↗</i>
            </a>
          ))}
        </nav>
        <div className="division-sidebar-socials" aria-label="Professional profiles">
          {portfolio.githubUrl && (
            <a href={portfolio.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub profile" title="GitHub">
              <SocialIcon platform="github" />
            </a>
          )}
          {portfolio.linkedinUrl && (
            <a href={portfolio.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn profile" title="LinkedIn">
              <SocialIcon platform="linkedin" />
            </a>
          )}
        </div>
      </aside>
    </>
  );
}
