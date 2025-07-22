import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';



@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

 constructor(private http: HttpClient) {}

 environment = environment;

 dashboardStats = {
  total_services: 0,
  total_testimonials: 0,
  total_contacts: 0,
  total_sliders: 0,
  total_partners: 0,
  total_products: 0,
  total_categories: 0,
};

ngOnInit() {
  const token = localStorage.getItem('auth_token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  this.http.get(`${environment.apiUrl}/dashboard-stats`, { headers }).subscribe({
    next: (res: any) => {
      this.dashboardStats = res;
    },
    error: (err) => {
      console.error('Failed to fetch dashboard stats', err);
    }
  });
}


}
