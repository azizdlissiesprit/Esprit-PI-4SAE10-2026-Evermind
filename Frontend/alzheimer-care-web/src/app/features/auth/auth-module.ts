import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // <--- CRITICAL IMPORT
import { AuthRoutingModule } from './auth-routing-module';

// Import LoginComponent as a standalone component
import { LoginComponent } from './pages/login/login';

@NgModule({
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule, // Import forms here
    LoginComponent // Import it here instead of declaring
  ],
})
export class AuthModule {}