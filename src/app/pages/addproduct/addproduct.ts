import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addproduct.html',
  styleUrls: ['./addproduct.css']
})
export class Addproduct implements OnInit {
  formData = {
    name: '',
    description: '',
    product_category_id: '',
    price: '',
    status: true,
    specifications: {
      dimensions: '',
      weight: '',
      material: '',
      warranty: '',
      certifications: ''
    }
  };
  productCategories: any[] = [];
  loading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProductCategories();
  }

  fetchProductCategories() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/product-categories`, { headers })
      .subscribe({
        next: (res) => {
          this.productCategories = res.data || res;
        },
        error: (err) => {
          console.error('Failed to fetch product-categories:', err);
          Swal.fire('Error', 'Failed to load product-categories', 'error');
        }
      });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire('Invalid File', 'Please select an image file', 'error');
        return;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB
        Swal.fire('File Too Large', 'Image must be less than 2MB', 'error');
        return;
      }

      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addProduct() {
    if (!this.formData.name.trim() || !this.formData.product_category_id || !this.formData.price) {
      Swal.fire('Error', 'Name, Product-Category, and Price are required', 'error');
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('name', this.formData.name.trim());
    formData.append('description', this.formData.description.trim());
    formData.append('product_category_id', this.formData.product_category_id);
    formData.append('price', this.formData.price);
    formData.append('status', this.formData.status ? '1' : '0');
    formData.append('specifications', JSON.stringify(this.formData.specifications));

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.http.post(`${environment.apiUrl}/products`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Product added successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to add product:', err);
          Swal.fire('Error', 'Failed to add product', 'error');
        }
      });
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }
} 