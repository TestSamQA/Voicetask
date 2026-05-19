import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AppShellComponent } from './shell/app-shell/app-shell.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TaskDetailComponent } from './tasks/task-detail/task-detail.component';
import { VoicePreviewComponent } from './voice/voice-preview/voice-preview.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';
import { LabelManagerComponent } from './admin/label-manager/label-manager.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tasks/:id', component: TaskDetailComponent },
      { path: 'voice/preview', component: VoicePreviewComponent },
      { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
      { path: 'admin/labels', component: LabelManagerComponent, canActivate: [adminGuard] },
    ],
  },
  { path: '**', redirectTo: '' },
];
