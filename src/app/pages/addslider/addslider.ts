import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxEditorModule } from 'ngx-editor';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Editor, Toolbar } from 'ngx-editor';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addslider',
  standalone: true,
  imports: [CommonModule, NgxEditorModule, FormsModule],
  templateUrl: './addslider.html',
  styleUrl: './addslider.css'
})
export class Addslider implements OnInit, OnDestroy {

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['text_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  formData = {
    title: '',
    description: ''
  };

  loading = false;
  showSuccess = false;

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.editor = new Editor({
      history: true,
      keyboardShortcuts: true,
      inputRules: true,
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onImageSelected(event: any): void {
    this.selectedImage = event.target.files[0];
    if (this.selectedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  submitSlider(): void {
    if (!this.formData.title.trim() || !this.formData.description.trim() || !this.selectedImage) {
      const missingFields = [];
      if (!this.formData.title.trim()) missingFields.push('Title');
      if (!this.formData.description.trim()) missingFields.push('Description');
      if (!this.selectedImage) missingFields.push('Image');

      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields!',
        html: `Please fill out the following field(s): <b><br>${missingFields.join(', ')}</b>`,
        confirmButtonText: 'OK'
      });
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      Swal.fire('Error!', 'User not authenticated!', 'error');
      return;
    }

    const data = new FormData();
    data.append('title', this.formData.title);
    data.append('description', this.formData.description);
    if (this.selectedImage) {
      data.append('image', this.selectedImage);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.loading = true;

    this.http.post(`${environment.apiUrl}/sliders`, data, { headers }).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess = true;
        this.formData = { title: '', description: '' };
        this.removeImage();

        setTimeout(() => {
          this.showSuccess = false;
          this.router.navigate(['/slider']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error!', 'Failed to add slider.', 'error');
        console.error(err);
      }
    });
  }
}
