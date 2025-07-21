import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  isMenuOpen = false;

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.router.navigate(['/login']);
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.startbar');
    const overlay = document.querySelector('.startbar-overlay');

    sidebar?.classList.toggle('startbar-visible');
    overlay?.classList.toggle('d-block');
  }


  
}
