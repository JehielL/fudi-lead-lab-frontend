import { Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, StatusBadge],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = this.authService.currentUser;
  readonly displayName = computed(() => {
    const user = this.user();
    return user?.name ?? user?.display_name ?? user?.email ?? user?.username ?? 'FÜDI Operator';
  });
  readonly displayMeta = computed(() => {
    const user = this.user();
    return user?.role ?? user?.roles?.[0] ?? user?.organization ?? 'Authenticated workspace';
  });
  readonly initials = computed(() =>
    this.displayName()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'FU',
  );

  readonly navItems: NavItem[] = [
    { label: 'Overview', path: '/overview', icon: 'M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z' },
    { label: 'Discovery', path: '/discovery', icon: 'M10.5 3a7.5 7.5 0 0 1 5.96 12.06l3.24 3.24-1.4 1.4-3.24-3.24A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z' },
    { label: 'Lead Inspector', path: '/lead-inspector', icon: 'M12 2 4 5.5v6.1c0 4.75 3.4 9.2 8 10.4 4.6-1.2 8-5.65 8-10.4V5.5L12 2Zm0 2.2 6 2.65v4.75c0 3.6-2.42 7.03-6 8.28-3.58-1.25-6-4.68-6-8.28V6.85l6-2.65Zm-1 4.8v4h2V9h-2Zm0 6v2h2v-2h-2Z' },
    { label: 'Campaigns', path: '/campaigns', icon: 'M3 11v2h4l5 5V6L7 11H3Zm13.5 1a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12Zm-2.5-9.5v2.06a8.5 8.5 0 0 1 0 14.88v2.06a10.5 10.5 0 0 0 0-19Z' },
    { label: 'Models', path: '/models', icon: 'M12 2a4 4 0 0 1 3.9 3.1A4 4 0 0 1 18 12.46V17a3 3 0 0 1-3 3h-1v-6h1a2 2 0 0 0 1.73-3A2 2 0 0 0 15 8h-1V6a2 2 0 1 0-4 0v2H9a2 2 0 0 0-1.73 3A2 2 0 0 0 9 14h1v6H9a3 3 0 0 1-3-3v-4.54A4 4 0 0 1 8.1 5.1 4 4 0 0 1 12 2Z' },
    { label: 'Ops', path: '/ops', icon: 'M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65-2-3.46-2.49 1a7.1 7.1 0 0 0-1.69-.98L15 3.27h-4l-.36 2.66c-.6.23-1.16.56-1.69.98l-2.49-1-2 3.46 2.11 1.65c-.04.32-.07.65-.07.98s.02.66.07.98l-2.11 1.65 2 3.46 2.49-1c.52.42 1.09.75 1.69.98L11 20.73h4l.36-2.66c.6-.23 1.16-.56 1.69-.98l2.49 1 2-3.46-2.11-1.65ZM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z' },
  ];

  ngOnInit(): void {
    this.authService
      .loadCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.authService.clearSession(),
      });
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
