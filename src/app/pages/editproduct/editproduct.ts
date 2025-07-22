import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editproduct',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editproduct.html',
  styleUrls: ['./editproduct.css']
})
export class Editproduct implements OnInit {
  productId: string = '';
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
  imagePreview: string | null = null;
  selectedImage: File | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.fetchProductCategories();
    this.fetchProduct();
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

  fetchProduct() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/products/${this.productId}`, { headers })
      .subscribe({
        next: (res) => {
          this.formData = {
            name: res.name,
            description: res.description || '',
            product_category_id: res.product_category_id,
            price: res.price,
            status: res.status,
            specifications: res.specifications ? JSON.parse(res.specifications) : {
              dimensions: '',
              weight: '',
              material: '',
              warranty: '',
              certifications: ''
            }
          };
          if (res.image) {
            this.imagePreview = `${environment.assetsUrl}${res.image}`;
          }
        },
        error: (err) => {
          console.error('Failed to fetch product:', err);
          Swal.fire('Error', 'Failed to load product details', 'error');
          this.router.navigate(['/products']);
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

  updateProduct() {
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
    formData.append('_method', 'PUT'); // Laravel requirement for PUT requests

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.http.post(`${environment.apiUrl}/products/${this.productId}`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Product updated successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Update failed:', err);
          Swal.fire('Error', 'Failed to update product', 'error');
        }
      });
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }
} 