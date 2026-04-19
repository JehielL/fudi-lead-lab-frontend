import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { GlassCard } from '../../shared/components/glass-card/glass-card';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, GlassCard, StatusBadge],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
})
export class LoginPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/overview';
        void this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.errorMessage.set('No pudimos iniciar sesion. Revisa tus credenciales e intentalo de nuevo.');
        this.isSubmitting.set(false);
      },
    });
  }
}
