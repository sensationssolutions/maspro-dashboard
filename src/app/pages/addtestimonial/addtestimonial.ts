import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-addtestimonial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addtestimonial.html',
  styleUrls: ['./addtestimonial.css']
})


export class Addtestimonial {

  constructor(private http: HttpClient, private router: Router) {}

  environment = environment;

  formData = {
    name: '',
    designation: '',
    message: '',
    stars: 5
  };

  loading = false;
  showSuccess = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire('Invalid File', 'Only image files are allowed.', 'error');
        return;
      }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      Swal.fire('File Too Large', 'Image must be under 2MB.', 'error');
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

setRating(rating: number) {
  this.formData.stars = rating;
}


removeImage() {
  this.selectedImage = null;
  this.imagePreview = null;
  this.resetFileInput(); 
}

resetFileInput() {
  const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
}

submitTestimonial() {
  const missingFields: string[] = [];

  if (!this.formData.name.trim()) {
    missingFields.push('Name');
  }

  if (!this.formData.message.trim()) {
    missingFields.push('Message');
  }

  if (!this.selectedImage) {
    missingFields.push('Image');
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
  if (!token) {
    this.loading = false;
    Swal.fire('Auth Error', 'User not authenticated!', 'error');
    return;
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  const data = new FormData();
  data.append('name', this.formData.name.trim());
  data.append('designation', this.formData.designation.trim());
  data.append('message', this.formData.message.trim());
  data.append('stars', this.formData.stars.toString());
  if (this.selectedImage) {
    data.append('image', this.selectedImage);
  }


  this.http.post(`${environment.apiUrl}/testimonials`, data, { headers }).subscribe({
    next: () => {
      this.loading = false;
      this.showSuccess = true;

      this.formData = { name: '', designation: '', message: '', stars: 5 };
      this.selectedImage = null;
      this.imagePreview = null;
      this.resetFileInput();

      setTimeout(() => {
        this.showSuccess = false;
        this.router.navigate(['/testimonials']);
      }, 1500);
    },
    error: (err) => {
      this.loading = false;
      Swal.fire('Error!', 'Failed to add testimonial.', 'error');
      console.error(err);
    }
  });
}



}

