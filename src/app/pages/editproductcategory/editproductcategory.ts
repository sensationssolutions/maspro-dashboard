import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editproductcategory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editproductcategory.html',
  styleUrls: ['./editproductcategory.css']
})
export class Editproductcategory implements OnInit {
  productCategoryId: string = '';
  formData = {
    name: '',
    description: '',
    sub_category_id: '',
    status: true
  };
  subcategories: any[] = [];
  loading = false;
  imagePreview: string | null = null;
  selectedImage: File | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productCategoryId = this.route.snapshot.params['id'];
    this.fetchSubcategories();
    this.fetchProductCategory();
  }

  fetchSubcategories() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/sub-categories`, { headers })
      .subscribe({
        next: (res) => {
          this.subcategories = res.data || res;
        },
        error: (err) => {
          console.error('Failed to fetch sub-categories:', err);
          Swal.fire('Error', 'Failed to load sub-categories', 'error');
        }
      });
  }

  fetchProductCategory() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/product-categories/${this.productCategoryId}`, { headers })
      .subscribe({
        next: (res) => {
          this.formData = {
            name: res.name,
            description: res.description || '',
            sub_category_id: res.sub_category_id,
            status: res.status
          };
          if (res.image) {
            this.imagePreview = `${environment.assetsUrl}${res.image}`;
          }
        },
        error: (err) => {
          console.error('Failed to fetch product-category:', err);
          Swal.fire('Error', 'Failed to load product-category details', 'error');
          this.router.navigate(['/productcategories']);
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

  updateProductCategory() {
    if (!this.formData.name.trim() || !this.formData.sub_category_id) {
      Swal.fire('Error', 'Name and Sub-Category are required', 'error');
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('name', this.formData.name.trim());
    formData.append('description', this.formData.description.trim());
    formData.append('sub_category_id', this.formData.sub_category_id);
    formData.append('status', this.formData.status ? '1' : '0');
    formData.append('_method', 'PUT'); // Laravel requirement for PUT requests

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.http.post(`${environment.apiUrl}/product-categories/${this.productCategoryId}`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Product-category updated successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/productcategories']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Update failed:', err);
          Swal.fire('Error', 'Failed to update product-category', 'error');
        }
      });
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }
} 