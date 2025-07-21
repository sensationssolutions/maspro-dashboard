import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-careers',
  imports: [],
  templateUrl: './careers.html',
  styleUrl: './careers.css'
})
export class Careers implements OnInit {
  careers: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCareers();
  }

  fetchCareers() {
    const token = localStorage.getItem('auth_token');
    const headers = {
      Authorization: `Bearer ${token}`
    };

    this.http.get<any[]>(`${environment.apiUrl}/careers`, { headers }).subscribe({
      next: (res) => {
        this.careers = res;
        console.log('✅ Careers loaded:', res);
      },
      error: (err) => {
        console.error('❌ Failed to load careers:', err);
        alert('Unable to fetch career data. Make sure you’re logged in.');
      }
    });
  }
}
