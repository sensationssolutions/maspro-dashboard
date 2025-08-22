import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class Products implements OnInit {
  environment = environment;
  products: any[] = [];
  categories: any[] = [];
  currentPage = 1;
  lastPage = 1;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProducts();
    this.fetchCategories();
  }

  fetchProducts(page: number = 1) {
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('page', page.toString());

    this.http.get<any>(`${environment.apiUrl}/products`, { headers, params }).subscribe({
      next: (res) => {
        console.log('Products API response:', res);
        this.products = res.data || res;
        console.log('Processed products:', this.products);
        if (this.products.length > 0 && this.products[0].images) {
          console.log('First product images:', this.products[0].images);
        }
        this.currentPage = res.current_page || 1;
        this.lastPage = res.last_page || 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.loading = false;
        Swal.fire('Error', 'Failed to load products', 'error');
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
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  deleteProduct(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This product will be deleted permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete<any>(`${environment.apiUrl}/products/${id}`, { headers }).subscribe({
          next: () => {
            this.products = this.products.filter(t => t.id !== id);
            Swal.fire({
              title: 'Deleted!',
              text: 'Product deleted successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete the product.', 'error');
          }
        });
      }
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.fetchProducts(page);
  }

  getImageUrl(imagePath: string): string {
    // Remove any leading slash from imagePath to avoid double slashes
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const url = environment.assetsUrl + 'storage/' + cleanImagePath;
    console.log('Image URL:', url);
    return url;
  }

  onImageError(event: any, image: any) {
    console.error('Image failed to load:', image.image, 'URL:', event.target.src);
    console.error('Full image object:', image);
  }

  onImageLoad(event: any, image: any) {
    console.log('Image loaded successfully:', image.image, 'URL:', event.target.src);
  }
} 