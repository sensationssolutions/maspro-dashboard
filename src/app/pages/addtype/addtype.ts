import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addtype',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './addtype.html',
  styleUrls: ['./addtype.css']
})
export class Addtype implements OnInit {
  formData = {
    category_id: '',
    name: '',
    description: '',
    status: true
  };
  loading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  environment = environment;
  categories: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any>(`${environment.apiUrl}/categories`, { headers }).subscribe({
      next: (res) => {
        this.categories = res.data || res;
      },
      error: (err) => {
        this.categories = [];
        console.error('Failed to load categories:', err);
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

  addType() {
    if (!this.formData.category_id || !this.formData.name.trim()) {
      Swal.fire('Error', 'Category and Name are required', 'error');
      return;
    }
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('category_id', this.formData.category_id);
    formData.append('name', this.formData.name.trim());
    formData.append('description', this.formData.description.trim());
    formData.append('status', this.formData.status ? '1' : '0');
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }
    this.http.post(`${environment.apiUrl}/types`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Type added successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/categories', this.formData.category_id, 'types']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to add type:', err);
          Swal.fire('Error', 'Failed to add type', 'error');
        }
      });
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }
} 