import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { Editor, Toolbar } from 'ngx-editor';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addblog',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule, RouterLink],
  templateUrl: './addblog.html',
  styleUrls: ['./addblog.css']
})
export class Addblog implements OnInit {
  formData = {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date as default
    status: true
  };
  
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
  }

  ngOnDestroy() {
    this.descriptionEditor.destroy();
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
          if (file.size > 2 * 1024 * 1024) { // 2MB limit
            Swal.fire('File Too Large', `Image ${file.name} must be under 2MB.`, 'error');
            continue;
          }
          
          this.selectedImages.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviews.push(e.target.result);
          };
          reader.readAsDataURL(file);
        } else {
          Swal.fire('Invalid File', `File ${file.name} is not an image.`, 'error');
        }
      }
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  addBlog() {
    const missingFields: string[] = [];

    if (!this.formData.title.trim()) {
      missingFields.push('Title');
    }

    if (!this.formData.description.trim()) {
      missingFields.push('Description');
    }

    if (!this.formData.date) {
      missingFields.push('Date');
    }

    if (this.selectedImages.length === 0) {
      missingFields.push('At least one image');
    }

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        html: `Please fill out the following field(s):<br><b>${missingFields.join('<br>')}</b>`,
        confirmButtonText: 'OK',
      });
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('title', this.formData.title.trim());
    formData.append('description', this.formData.description.trim());
    formData.append('date', this.formData.date);
    formData.append('status', this.formData.status ? '1' : '0');

    // Add images
    this.selectedImages.forEach((image, index) => {
      formData.append(`images[]`, image);
    });

    this.http.post(`${environment.apiUrl}/blogs`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Blog added successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/blogs']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to add blog:', err);
          Swal.fire('Error', 'Failed to add blog', 'error');
        }
      });
  }
}
