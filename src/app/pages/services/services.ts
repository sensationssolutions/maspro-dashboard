import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services.html',
  styleUrls: ['./services.css']
})
export class Services implements OnInit {
  environment = environment;
  services: any[] = [];
  currentPage = 1;
  lastPage = 1;
  loading: boolean = false; // ✅ Added this to fix the error

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchServices();
  }

  fetchServices(page: number = 1) {
    this.loading = true;

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('page', page.toString());

    this.http.get<any>(`${environment.apiUrl}/services`, { headers, params }).subscribe({
      next: (res) => {
        this.services = res.data.map((service: any) => {
          if (typeof service.points === 'string') {
            try {
              service.points = JSON.parse(service.points);
            } catch (err) {
              service.points = [];
              console.error('Invalid JSON in points:', err);
            }
          }
          return service;
        });

        this.currentPage = res.current_page;
        this.lastPage = res.last_page;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load services:', err);
        this.loading = false;
      }
    });
  }

  deleteService(serviceId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This service and its image will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete<any>(`${environment.apiUrl}/services/${serviceId}`, { headers }).subscribe({
          next: (res) => {
            this.services = this.services.filter(service => service.id !== serviceId);

            Swal.fire({
              title: 'Deleted!',
              text: 'The service was successfully deleted.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to delete the service.', 'error');
          }
        });
      }
    });
  }


  toggleStatus(service: any) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put<any>(`${environment.apiUrl}/services/${service.id}/toggle-status`, {}, { headers }).subscribe({
      next: (res) => {
        service.status = res.status; 
        Swal.fire({
          title: 'Updated!',
          text: `Service is now ${res.status ? 'Active' : 'Inactive'}.`,
          icon: 'success',
          timer: 1200,
          showConfirmButton: false
        });
      },
      error: () => {
        Swal.fire('Error!', 'Failed to update status.', 'error');
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.fetchServices(page);
    }
  }
}
