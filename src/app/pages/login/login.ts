import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})


export class Login {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false; 

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.isLoading = true; // start loader

    const payload = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>(`${environment.apiUrl}/login`, payload).subscribe({
      next: (res) => {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        setTimeout(() => {
          this.isLoading = false; 
          this.router.navigate(['/home']);
        }, 500);
      },
      error: (err) => {
        this.isLoading = false; 
        console.error('Login failed:', err);
        alert('Invalid credentials or server error.');
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}


