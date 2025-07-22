import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RouterModule } from '@angular/router';
import { CommonModule, SlicePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-types',
  templateUrl: './types.html',
  styleUrls: ['./types.css'],
  imports: [RouterModule, CommonModule, SlicePipe]
})
export class Types implements OnInit {
  environment = environment;
  types: any[] = [];
  categoryId: number | null = null;
  loading = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryId = +params['categoryId'];
      if (this.categoryId) {
        this.fetchTypesForCategory(this.categoryId);
      }
    });
  }

  fetchTypesForCategory(categoryId: number) {
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any>(`${environment.apiUrl}/categories/${categoryId}/types`, { headers }).subscribe({
      next: (res) => {
        this.types = res.data || res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.types = [];
        console.error('Failed to load types:', err);
      }
    });
  }

  deleteType(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This type will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.delete<any>(`${environment.apiUrl}/types/${id}`, { headers }).subscribe({
          next: () => {
            this.types = this.types.filter(t => t.id !== id);
            Swal.fire({
              title: 'Deleted!',
              text: 'Type deleted successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete the type.', 'error');
          }
        });
      }
    });
  }
} 