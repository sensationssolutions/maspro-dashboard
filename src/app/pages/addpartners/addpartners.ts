import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-addpartners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addpartners.html',
  styleUrl: './addpartners.css'
})
export class Addpartners {

  constructor(private http: HttpClient, private router: Router) {}

  environment = environment;
  loading = false;
  showSuccess = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
    if (this.selectedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
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

  submitPartner() {
    if (!this.selectedImage) {
      Swal.fire('Validation Error', 'Please select a partner image.', 'warning');
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const data = new FormData();
    data.append('image', this.selectedImage);

    this.http.post(`${environment.apiUrl}/partners`, data, { headers }).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess = true;
        this.selectedImage = null;
        this.imagePreview = null;
        this.resetFileInput();

        setTimeout(() => {
          this.showSuccess = false;
          this.router.navigate(['/partners']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error!', 'Failed to add partner.', 'error');
        console.error(err);
      }
    });
  }
}
