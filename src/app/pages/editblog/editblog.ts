import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { Editor, Toolbar } from 'ngx-editor';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editblog',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule, RouterLink],
  templateUrl: './editblog.html',
  styleUrls: ['./editblog.css']
})
export class Editblog implements OnInit {
  formData = {
    title: '',
    description: '',
    date: '',
    status: true
  };
  
  blogId: number = 0;
  loading = false;
  loadingData = true;
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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.descriptionEditor = new Editor();
    this.blogId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBlogData();
  }

  ngOnDestroy() {
    this.descriptionEditor.destroy();
  }

  loadBlogData() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`${environment.apiUrl}/blogs/${this.blogId}`, { headers })
      .subscribe({
        next: (data: any) => {
          const blog = data.data;
          this.formData = {
            title: blog.title,
            description: blog.description,
            date: blog.date,
            status: blog.status == 1
          };
          this.existingImages = blog.images || [];
          this.loadingData = false;
        },
        error: (err) => {
          console.error('Failed to load blog:', err);
          this.loadingData = false;
          Swal.fire('Error', 'Failed to load blog data', 'error');
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

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  updateBlog() {
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

    if (this.existingImages.length === 0 && this.selectedImages.length === 0) {
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
    formData.append('_method', 'PUT');

    // Add existing image IDs to keep
    this.existingImages.forEach((image, index) => {
      formData.append(`existing_images[]`, image.id);
    });

    // Add new images
    this.selectedImages.forEach((image, index) => {
      formData.append(`new_images[]`, image);
    });

    this.http.post(`${environment.apiUrl}/blogs/${this.blogId}`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Blog updated successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/blogs']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to update blog:', err);
          Swal.fire('Error', 'Failed to update blog', 'error');
        }
      });
  }
}
