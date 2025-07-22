import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxEditorModule } from 'ngx-editor';
import { Editor, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-addcategory',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule],
  templateUrl: './addcategory.html',
  styleUrls: ['./addcategory.css']
})
export class Addcategory {
  formData = {
    name: '',
    slug: '',
    title: '',
    description: '',
    status: true
  };
  loading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  environment = environment;
  slugEdited = false;

  // ngx-editor
  descriptionEditor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['align_left', 'align_center', 'align_right'],
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.descriptionEditor = new Editor();
  }

  ngOnDestroy(): void {
    this.descriptionEditor.destroy();
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

  onNameChange() {
    if (!this.slugEdited) {
      this.formData.slug = this.generateSlug(this.formData.name);
    }
  }

  onSlugChange() {
    this.slugEdited = true;
  }

  private generateSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/--+/g, '-');
  }

  addCategory() {
    if (!this.formData.name.trim() || !this.formData.slug.trim() || !this.formData.title.trim()) {
      Swal.fire('Error', 'Name, Slug, and Title are required', 'error');
      return;
    }
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('name', this.formData.name.trim());
    formData.append('slug', this.formData.slug.trim());
    formData.append('title', this.formData.title.trim());
    formData.append('description', this.formData.description || '');
    formData.append('status', this.formData.status ? '1' : '0');
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }
    this.http.post(`${environment.apiUrl}/categories`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Category added successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to add category:', err);
          Swal.fire('Error', 'Failed to add category', 'error');
        }
      });
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }
} 