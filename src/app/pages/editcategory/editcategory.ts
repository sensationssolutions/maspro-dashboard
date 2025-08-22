import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxEditorModule, Editor } from 'ngx-editor';
import { StripHtmlPipe } from '../categories/strip-html.pipe';

@Component({
  selector: 'app-editcategory',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule, StripHtmlPipe],
  templateUrl: './editcategory.html',
  styleUrls: ['./editcategory.css']
})
export class Editcategory implements OnInit, OnDestroy {
  categoryId: string = '';
  formData = {
    name: '',
    slug: '',
    title: '',
    description: '',
    status: true
  };
  loading = false;
  imagePreview: string | null = null;
  selectedImage: File | null = null;
  descriptionEditor!: Editor;
  toolbar: any = [
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
    this.categoryId = this.route.snapshot.params['id'];
    this.fetchCategory();
    this.descriptionEditor = new Editor();
  }

  ngOnDestroy(): void {
    this.descriptionEditor?.destroy();
  }

  fetchCategory() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/categories/${this.categoryId}`, { headers })
      .subscribe({
        next: (res) => {
          this.formData = {
            name: res.name,
            slug: res.slug,
            title: res.title,
            description: res.description || '',
            status: res.status
          };
          if (res.image) {
            this.imagePreview = this.getImageUrl(res.image);
          }
        },
        error: (err) => {
          console.error('Failed to fetch category:', err);
          Swal.fire('Error', 'Failed to load category details', 'error');
          this.router.navigate(['/categories']);
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

  updateCategory() {
    if (!this.formData.name.trim()) {
      Swal.fire('Error', 'Name is required', 'error');
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('name', this.formData.name.trim());
    formData.append('slug', this.formData.slug.trim());
    formData.append('description', this.formData.description.trim());
    formData.append('title', this.formData.title.trim());
    formData.append('status', this.formData.status ? '1' : '0');
    formData.append('_method', 'PUT'); // Laravel requirement for PUT requests

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.http.post(`${environment.apiUrl}/categories/${this.categoryId}`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Category updated successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Update failed:', err);
          Swal.fire('Error', 'Failed to update category', 'error');
        }
      });
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  private getImageUrl(imagePath: string): string {
    // Remove any leading slash from imagePath to avoid double slashes
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const url = environment.assetsUrl  + cleanImagePath;
    console.log('Edit Category Image URL:', url);
    return url;
  }

  onImageError(event: any, image: any) {
    console.error('Edit category image failed to load:', image, 'URL:', event.target.src);
  }

  onImageLoad(event: any, image: any) {
    console.log('Edit category image loaded successfully:', image, 'URL:', event.target.src);
  }
} 