import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productcategories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './productcategories.html',
  styleUrls: ['./productcategories.css']
})
export class Productcategories implements OnInit {
  environment = environment;
  productCategories: any[] = [];
  subcategories: any[] = [];
  currentPage = 1;
  lastPage = 1;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProductCategories();
    this.fetchSubcategories();
  }

  fetchProductCategories(page: number = 1) {
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('page', page.toString());

    this.http.get<any>(`${environment.apiUrl}/product-categories`, { headers, params }).subscribe({
      next: (res) => {
        this.productCategories = res.data || res;
        this.currentPage = res.current_page || 1;
        this.lastPage = res.last_page || 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load product-categories:', err);
        this.loading = false;
        Swal.fire('Error', 'Failed to load product-categories', 'error');
      }
    });
  }

  fetchSubcategories() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/sub-categories`, { headers }).subscribe({
      next: (res) => {
        this.subcategories = res.data || res;
      },
      error: (err) => {
        console.error('Failed to load sub-categories:', err);
      }
    });
  }

  getSubcategoryName(subcategoryId: number): string {
    const subcategory = this.subcategories.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : 'Unknown';
  }

  deleteProductCategory(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This product-category and all its products will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete<any>(`${environment.apiUrl}/product-categories/${id}`, { headers }).subscribe({
          next: () => {
            this.productCategories = this.productCategories.filter(t => t.id !== id);
            Swal.fire({
              title: 'Deleted!',
              text: 'Product-category deleted successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete the product-category.', 'error');
          }
        });
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.fetchProductCategories(page);
    }
  }
} 