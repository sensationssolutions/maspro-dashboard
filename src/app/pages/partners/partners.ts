import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './partners.html',
  styleUrl: './partners.css'
})
export class Partners implements OnInit {

  environment = environment;
  partners: any[] = [];
  currentPage = 1;
  lastPage = 1;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPartners();
  }

fetchPartners(page: number = 1): void {
  this.loading = true;

  const token = localStorage.getItem('auth_token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const params = new HttpParams().set('page', page.toString());

  this.http.get<any>(`${environment.apiUrl}/partners`, { headers, params }).subscribe({
    next: (res) => {
      this.partners = res.data;
      this.currentPage = res.current_page;
      this.lastPage = res.last_page;
      this.loading = false;
    },
    error: (err) => {
      console.error('Failed to load partners:', err);
      this.loading = false;
    }
  });
}


  deletePartner(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This partner logo will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete(`${environment.apiUrl}/partners/${id}`, { headers }).subscribe({
          next: () => {
            this.partners = this.partners.filter(p => p.id !== id);
            Swal.fire({
              title: 'Deleted!',
              text: 'Partner deleted successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete the partner.', 'error');
          }
        });
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.lastPage) {
      this.fetchPartners(page);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.fetchPartners(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.fetchPartners(this.currentPage + 1);
    }
  }
}
