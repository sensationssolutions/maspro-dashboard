import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subcategories.html',
  styleUrls: ['./subcategories.css']
})
export class Subcategories implements OnInit {
  environment = environment;
  subcategories: any[] = [];
  categories: any[] = [];
  currentPage = 1;
  lastPage = 1;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchSubcategories();
    this.fetchCategories();
  }

  fetchSubcategories(page: number = 1) {
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('page', page.toString());

    this.http.get<any>(`${environment.apiUrl}/sub-categories`, { headers, params }).subscribe({
      next: (res) => {
        this.subcategories = res.data || res;
        this.currentPage = res.current_page || 1;
        this.lastPage = res.last_page || 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load sub-categories:', err);
        this.loading = false;
        Swal.fire('Error', 'Failed to load sub-categories', 'error');
      }
    });
  }

  fetchCategories() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/categories`, { headers }).subscribe({
      next: (res) => {
        this.categories = res.data || res;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  getSpecificationsText(specifications: any): string {
    if (!specifications) return 'No specifications';
    
    try {
      const specs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      const specsArray = Object.entries(specs).map(([key, value]) => `${key}: ${value}`);
      return specsArray.slice(0, 2).join(', ') + (specsArray.length > 2 ? '...' : '');
    } catch (e) {
      return 'Invalid specifications';
    }
  }

  getSpecificationsArray(specifications: any): { key: string, value: string }[] {
    if (!specifications) return [];
    let specs: any = specifications;
    if (typeof specifications === 'string') {
      try {
        specs = JSON.parse(specifications);
      } catch {
        return [];
      }
    }
    return Object.entries(specs).map(([key, value]) => ({
      key: key.replace(/_/g, ' '),
      value: String(value)
    }));
  }

  deleteSubcategory(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This sub-category and all its product-categories will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete<any>(`${environment.apiUrl}/sub-categories/${id}`, { headers }).subscribe({
          next: () => {
            this.subcategories = this.subcategories.filter(t => t.id !== id);
            Swal.fire({
              title: 'Deleted!',
              text: 'Sub-category deleted successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete the sub-category.', 'error');
          }
        });
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.fetchSubcategories(page);
    }
  }
} 