import { Component, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Sidebar } from './components/sidebar/sidebar';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header, Footer, RouterOutlet, Sidebar, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showLayout = signal(true);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const hiddenRoutes = ['/login', '/'];
        this.showLayout.set(!hiddenRoutes.includes(url));
      });
  }
}
