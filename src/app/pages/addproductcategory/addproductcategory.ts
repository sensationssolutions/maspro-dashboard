import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addproductcategory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addproductcategory.html',
  styleUrls: ['./addproductcategory.css']
})
export class Addproductcategory implements OnInit {
  formData = {
    name: '',
    description: '',
    sub_category_id: '',
    status: true
  };
  subcategories: any[] = [];
  loading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchSubcategories();
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

  addProductCategory() {
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

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.http.post(`${environment.apiUrl}/product-categories`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Product-category added successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/productcategories']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to add product-category:', err);
          Swal.fire('Error', 'Failed to add product-category', 'error');
        }
      });
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }
} 