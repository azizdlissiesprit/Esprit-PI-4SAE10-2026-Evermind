import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // <--- 1. Import RouterModule

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule], // <--- 2. Add RouterModule to this list
  templateUrl: './auth-layout.html',
  //styleUrls: ['./auth-layout.scss']
})
export class AuthLayoutComponent {}