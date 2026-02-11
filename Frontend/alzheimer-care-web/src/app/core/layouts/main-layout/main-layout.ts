import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // <--- 1. Import this

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule], // <--- 2. Add this Array
  templateUrl: './main-layout.html',
  //styleUrls: ['./main-layout.scss'] 
})
export class MainLayoutComponent {}