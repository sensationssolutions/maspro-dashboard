import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxEditorModule } from 'ngx-editor';
import { Editor } from 'ngx-editor';

interface Specifications {
  power_source: string;
  backup_battery: string;
  app_compatibility: string;
  certifications: string;
  [key: string]: string;
}

@Component({
  selector: 'app-addsubcategory',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule],
  templateUrl: './addsubcategory.html',
  styleUrls: ['./addsubcategory.css']
})
export class Addsubcategory implements OnInit {
  formData = {
    name: '',
    slug: '',
    title: '',
    description: '',
    category_id: '',
    status: true,
    specifications: {
      power_source: '',
      backup_battery: '',
      app_compatibility: '',
      certifications: ''
    } as Specifications
  };
  categories: any[] = [];
  loading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  descriptionEditor!: Editor;
  toolbar: any = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['align_left', 'align_center', 'align_right'],
  ];
  slugEdited = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.descriptionEditor = new Editor();
  }
  ngOnDestroy(): void {
    this.descriptionEditor?.destroy();
  }

  fetchCategories() {
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

  addSubcategory() {
    if (!this.formData.name.trim() || !this.formData.category_id) {
      Swal.fire('Error', 'Name and Category are required', 'error');
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('name', this.formData.name.trim());
    formData.append('slug', this.formData.slug.trim());
    formData.append('title', this.formData.title.trim());
    formData.append('description', this.formData.description.trim());
    formData.append('category_id', this.formData.category_id);
    formData.append('status', this.formData.status ? '1' : '0');

    // Send specifications as an array of values for each key
    for (const key in this.formData.specifications) {
      if (Object.prototype.hasOwnProperty.call(this.formData.specifications, key)) {
        formData.append(`specifications[${key}][]`, this.formData.specifications[key]);
      }
    }

    // Always send image as a string (empty if not selected)
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    } else {
      formData.append('image', '');
    }

    this.http.post(`${environment.apiUrl}/sub-categories`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Sub-category added successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/subcategories']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to add sub-category:', err);
          Swal.fire('Error', 'Failed to add sub-category', 'error');
        }
      });
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }
} 