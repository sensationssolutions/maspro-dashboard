import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxEditorModule } from 'ngx-editor';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Editor, Toolbar } from 'ngx-editor';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-websitepieces',
  standalone: true,
  imports: [CommonModule, NgxEditorModule, FormsModule],
  templateUrl: './websitepieces.html',
  styleUrl: './websitepieces.css'
})
export class Websitepieces implements OnInit, OnDestroy {

  headingEditor!: Editor;
  titleEditor!: Editor;
  descriptionEditor!: Editor;

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['align_left', 'align_center', 'align_right'],
  ];

  formData = {
    type: 'welcome_note',
    heading: '',
    title: '',
    description: ''
  };

  homeImageFile: File | null = null;
  aboutImageFile: File | null = null;
  homeImagePreview: string | null = null;
  aboutImagePreview: string | null = null;

  loading = false;
  showSuccess = false;
  existingPiece: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.headingEditor = new Editor();
    this.titleEditor = new Editor();
    this.descriptionEditor = new Editor();
    this.loadExistingPiece();
  }

  ngOnDestroy(): void {
    this.headingEditor.destroy();
    this.titleEditor.destroy();
    this.descriptionEditor.destroy();
  }

  isMissionVision(): boolean {
    return this.formData.type === 'mission' || this.formData.type === 'vision';
  }

  onTypeChange(): void {
    this.homeImageFile = null;
    this.aboutImageFile = null;
    this.homeImagePreview = null;
    this.aboutImagePreview = null;
    this.resetFileInput('homeImageUpload');
    this.resetFileInput('aboutImageUpload');
    this.loadExistingPiece();
  }

  loadExistingPiece(): void {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.loading = true;

    this.http.get(`${environment.apiUrl}/website-piece/${this.formData.type}`, { headers }).subscribe({
      next: (res: any) => {
        this.existingPiece = res;
        this.formData.heading = res.heading || '';
        this.formData.title = res.title || '';
        this.formData.description = res.description || '';


        this.homeImagePreview = res.home_image ? environment.assetsUrl + res.home_image : null;
        this.aboutImagePreview = res.about_image ? environment.assetsUrl + res.about_image : null;


        this.loading = false;
      },
      error: () => {
        this.existingPiece = null;
        this.formData.heading = '';
        this.formData.title = '';
        this.formData.description = '';
        this.loading = false;
      }
    });
  }

  onImageSelected(event: any, type: 'home' | 'about'): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'home') {
        this.homeImageFile = file;
        this.homeImagePreview = reader.result as string;
      } else {
        this.aboutImageFile = file;
        this.aboutImagePreview = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  removeImage(type: 'home' | 'about'): void {
    if (type === 'home') {
      this.homeImageFile = null;
      this.homeImagePreview = null;
      this.resetFileInput('homeImageUpload');
    } else {
      this.aboutImageFile = null;
      this.aboutImagePreview = null;
      this.resetFileInput('aboutImageUpload');
    }
  }

  resetFileInput(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  onSubmit(): void {
    const requiredFields = [];

    if (!this.formData.type) requiredFields.push('Type');
    if (!this.isMissionVision() && !this.formData.heading.trim()) requiredFields.push('Heading');
    if (!this.formData.title.trim()) requiredFields.push('Title');
    if (!this.formData.description.trim()) requiredFields.push('Description');

    if (requiredFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields!',
        html: `Please fill out the following field(s):<br><b>${requiredFields.join(', ')}</b>`,
        confirmButtonText: 'OK'
      });
      return;
    }

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.loading = true;

    const formDataToSend = new FormData();
    formDataToSend.append('type', this.formData.type);
    formDataToSend.append('heading', this.formData.heading || '');
    formDataToSend.append('title', this.formData.title || '');
    formDataToSend.append('description', this.formData.description || '');

    if (this.formData.type === 'about') {
      if (this.homeImageFile) {
        formDataToSend.append('home_image', this.homeImageFile);
      }
      if (this.aboutImageFile) {
        formDataToSend.append('about_image', this.aboutImageFile);
      }
    }

    const url = this.existingPiece
    ? `${environment.apiUrl}/websitepieces/${this.existingPiece.id}`
    : `${environment.apiUrl}/websitepieces`;

    if (this.existingPiece) {
      formDataToSend.append('_method', 'PUT');
    }

    this.http.post(url, formDataToSend, { headers }).subscribe({
      next: () => {
        this.showSuccess = true;
        this.loading = false;
        this.loadExistingPiece();
      },
      error: (error) => {
        console.error('Save error:', error);
        Swal.fire('Error!', 'Failed to save content.', 'error');
        this.loading = false;
      }
    });
  }
}
