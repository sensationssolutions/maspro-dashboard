import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-edittestimonial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edittestimonial.html',
  styleUrls: ['./edittestimonial.css']
})
export class Edittestimonial implements OnInit {
  environment = environment;
  testimonialId!: number;

  formData = {
    name: '',
    designation: '',
    message: '',
    image_url: '',
    stars: 5
  };

  selectedImage: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  showSuccess = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,

    ) {}

  ngOnInit(): void {
    this.testimonialId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchTestimonial();
  }

  fetchTestimonial() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/testimonials/${this.testimonialId}`, { headers })
    .subscribe({
      next: (res) => {
        this.formData.name = res.name;
        this.formData.designation = res.designation;
        this.formData.message = res.message;
        this.formData.image_url = res.image_url;
        this.formData.stars = res.stars || 5;
        this.imagePreview = this.environment.assetsUrl + res.image_url;
      },
      error: () => {
        Swal.fire('Error!', 'Failed to load testimonial.', 'error');
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

  setRating(rating: number) {
    this.formData.stars = rating;
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  resetFileInput() {
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  updateTestimonial() {
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const data = new FormData();
    data.append('name', this.formData.name);
    data.append('designation', this.formData.designation);
    data.append('message', this.formData.message);
    data.append('stars', this.formData.stars.toString());
    if (this.selectedImage) {
      data.append('image', this.selectedImage);
    }

    this.http.post<any>(`${environment.apiUrl}/testimonials/${this.testimonialId}?_method=PUT`, data, { headers })
    .subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess = true;
        this.resetFileInput();

        setTimeout(() => {
          this.showSuccess = false;
          this.router.navigate(['/testimonials']); 
        }, 1500); 

      },
      error: () => {
        this.loading = false;
        Swal.fire('Error!', 'Failed to update testimonial.', 'error');
      }
    });
  }
}
