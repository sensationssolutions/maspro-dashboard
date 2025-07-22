import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class Categories implements OnInit {
  environment = environment;
  categories: any[] = [];
  currentPage = 1;
  lastPage = 1;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(page: number = 1) {
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('page', page.toString());

    this.http.get<any>(`${environment.apiUrl}/categories`, { headers, params }).subscribe({
      next: (res) => {
        this.categories = res.data || res;
        this.currentPage = res.current_page || 1;
        this.lastPage = res.last_page || 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.loading = false;
        Swal.fire('Error', 'Failed to load categories', 'error');
      }
    });
  }

  deleteCategory(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This category and all its sub-categories will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete<any>(`${environment.apiUrl}/categories/${id}`, { headers }).subscribe({
          next: () => {
            this.categories = this.categories.filter(t => t.id !== id);
            Swal.fire({
              title: 'Deleted!',
              text: 'Category deleted successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete the category.', 'error');
          }
        });
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.fetchCategories(page);
    }
  }
}
