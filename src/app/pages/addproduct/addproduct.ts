import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { Editor, Toolbar } from 'ngx-editor';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule],
  templateUrl: './addproduct.html',
  styleUrls: ['./addproduct.css']
})
export class Addproduct implements OnInit {
  formData = {
    name: '',
    slug: '',
    description: '',
    category_id: '',
    status: true
  };
  categories: any[] = [];
  loading = false;
  selectedImages: File[] = [];
  imagePreviews: string[] = [];
  environment = environment;

  // ngx-editor
  descriptionEditor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['align_left', 'align_center', 'align_right'],
  ];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.descriptionEditor = new Editor();
    this.loadCategories();
  }

  ngOnDestroy() {
    this.descriptionEditor.destroy();
  }

  loadCategories() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`${environment.apiUrl}/categories`, { headers })
      .subscribe({
        next: (data: any) => {
          this.categories = data.data || [];
        },
        error: (err) => {
          console.error('Failed to load categories:', err);
        }
      });
  }

  onImagesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      // Clear previous selections if adding new ones
      if (this.selectedImages.length === 0) {
        this.selectedImages = [];
        this.imagePreviews = [];
      }
      
      // Add new images (up to 4 total)
      for (let i = 0; i < files.length && this.selectedImages.length < 4; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          this.selectedImages.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviews.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  onNameChange() {
    // Auto-generate slug from name
    this.formData.slug = this.formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }

  addProduct() {
    if (!this.formData.name.trim() || !this.formData.category_id) {
      Swal.fire('Error', 'Name and Category are required', 'error');
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('name', this.formData.name.trim());
    formData.append('slug', this.formData.slug);
    formData.append('description', this.formData.description.trim());
    formData.append('category_id', this.formData.category_id);
    formData.append('status', this.formData.status ? '1' : '0');

    // Add images
    this.selectedImages.forEach((image, index) => {
      formData.append(`images[]`, image);
    });

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
} 