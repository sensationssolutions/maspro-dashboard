import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-editpartners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editpartners.html',
  styleUrl: './editpartners.css'
})
export class Editpartners implements OnInit {

  environment = environment;
  partnerId!: number;

  imagePreview: string | null = null;
  selectedImage: File | null = null;
  loading = false;
  showSuccess = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.partnerId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchPartner();
  }

  fetchPartner() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/partners/${this.partnerId}`, { headers })
      .subscribe({
        next: (res) => {
          this.imagePreview = this.environment.assetsUrl + res.image_url;
        },
        error: () => {
          Swal.fire('Error!', 'Failed to load partner.', 'error');
        }
      });
  }

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

  updatePartner() {
    if (!this.selectedImage) {
      Swal.fire('Validation Error', 'Please select a new image to update.', 'warning');
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const data = new FormData();
    data.append('image', this.selectedImage);
    data.append('_method', 'PUT'); // Method spoofing

    this.http.post<any>(`${environment.apiUrl}/partners/${this.partnerId}`, data, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          this.showSuccess = true;
          this.resetFileInput();

          setTimeout(() => {
            this.showSuccess = false;
            this.router.navigate(['/partners']);
          }, 1500);
        },
        error: () => {
          this.loading = false;
          Swal.fire('Error!', 'Failed to update partner.', 'error');
        }
      });
  }
}
