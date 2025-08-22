import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { Editor, Toolbar } from 'ngx-editor';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editproduct',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule],
  templateUrl: './editproduct.html',
  styleUrls: ['./editproduct.css']
})
export class Editproduct implements OnInit, OnDestroy {
  productId: string = '';
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
  existingImages: any[] = [];
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
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.descriptionEditor = new Editor();
    this.productId = this.route.snapshot.params['id'];
    this.loadCategories();
    this.loadProduct();
  }

  ngOnDestroy() {
    this.descriptionEditor.destroy();
  }

  loadCategories() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/categories`, { headers })
      .subscribe({
        next: (res) => {
          this.categories = res.data || res;
        },
        error: (err) => {
          console.error('Failed to fetch categories:', err);
          Swal.fire('Error', 'Failed to load categories', 'error');
        }
      });
  }

  loadProduct() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/products/${this.productId}`, { headers })
      .subscribe({
        next: (res) => {
          this.formData = {
            name: res.name,
            slug: res.slug,
            description: res.description || '',
            category_id: res.category_id,
            status: res.status
          };
          
          if (res.images && res.images.length > 0) {
            this.existingImages = res.images.map((img: any) => ({
              ...img,
              url: this.getImageUrl(img.image)
            }));
          }
        },
        error: (err) => {
          console.error('Failed to fetch product:', err);
          Swal.fire('Error', 'Failed to load product details', 'error');
          this.router.navigate(['/products']);
        }
      });
  }

  onImagesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      // Add new images (up to 4 total including existing)
      for (let i = 0; i < files.length && (this.selectedImages.length + this.existingImages.length) < 4; i++) {
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

  removeNewImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  removeExistingImage(imageId: string) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`${environment.apiUrl}/products/${this.productId}/images/${imageId}`, { headers })
      .subscribe({
        next: () => {
          this.existingImages = this.existingImages.filter(img => img.id !== imageId);
          Swal.fire('Success', 'Image removed successfully', 'success');
        },
        error: (err) => {
          console.error('Failed to remove image:', err);
          Swal.fire('Error', 'Failed to remove image', 'error');
        }
      });
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

  updateProduct() {
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
    formData.append('_method', 'PUT'); // Laravel requirement for PUT requests

    // Add new images
    this.selectedImages.forEach((image, index) => {
      formData.append(`images[]`, image);
    });

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

  getImageUrl(imagePath: string): string {
    // Remove any leading slash from imagePath to avoid double slashes
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const url = environment.assetsUrl + 'storage/' + cleanImagePath;
    console.log('Edit Product Image URL:', url);
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