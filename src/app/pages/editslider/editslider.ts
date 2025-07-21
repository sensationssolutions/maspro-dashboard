import { Component, OnInit, OnDestroy } from '@angular/core';
import { Editor, Toolbar } from 'ngx-editor';
import { NgxEditorModule } from 'ngx-editor';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-editslider',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule],
  templateUrl: './editslider.html',
  styleUrls: ['./editslider.css']
})
export class Editslider implements OnInit, OnDestroy {
  environment = environment;
  sliderId!: number;

  formData = {
    title: '',
    description: '',
    image: ''
  };

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['align_left', 'align_center', 'align_right'],
  ];

  selectedImage: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  showSuccess = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
    this.sliderId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchSlider();
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  fetchSlider() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/sliders/${this.sliderId}`, { headers })
      .subscribe({
        next: (res) => {
          this.formData.title = res.title;
          this.formData.description = res.description;
          this.formData.image = res.image;
          this.imagePreview = this.environment.assetsUrl + res.image;
        },
        error: () => {
          Swal.fire('Error!', 'Failed to load slider.', 'error');
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
  }

  resetFileInput() {
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  updateSlider() {
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const data = new FormData();
    data.append('title', this.formData.title);
    data.append('description', this.formData.description);
    if (this.selectedImage) {
      data.append('image', this.selectedImage);
    }

    this.http.post<any>(
      `${environment.apiUrl}/sliders/${this.sliderId}?_method=PUT`,
      data,
      { headers }
    ).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess = true;
        this.resetFileInput();

        setTimeout(() => {
          this.showSuccess = false;
          this.router.navigate(['/slider']);
        }, 1500);
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error!', 'Failed to update slider.', 'error');
      }
    });
  }
}
