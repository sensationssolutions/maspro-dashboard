import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';

@Component({
  selector: 'app-sitedetails',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule],
  templateUrl: './sitedetails.html',
  styleUrls: ['./sitedetails.css'],
})
export class Sitedetails implements OnInit, OnDestroy {
  constructor(private http: HttpClient, private router: Router) {}

  environment = environment;
  loading = false;
  showSuccess = false;

  formData = {
    instagram: '',
    facebook: '',
    phone1: '',
    phone2: '',
    email: '',
    address: ''
  };

  logo: File | null = null;
  favicon: File | null = null;
  logoPreview: string | null = null;
  faviconPreview: string | null = null;

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  ngOnInit(): void {
    this.editor = new Editor();
    this.loadSiteDetails(); 
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }


  loadSiteDetails() {
    this.http.get<any>(`${environment.apiUrl}/sitedetails`).subscribe({
      next: (res) => {
        if (res) {
          this.formData.instagram = res.instagram || '';
          this.formData.facebook = res.facebook || '';
          this.formData.phone1 = res.phone1 || '';
          this.formData.phone2 = res.phone2 || '';
          this.formData.email = res.email || '';
          this.formData.address = res.address || '';

          this.logoPreview = res.logo ? `${environment.assetsUrl}/${res.logo.replace('storage/', '')}` : null;
          this.faviconPreview = res.favicon ? `${environment.assetsUrl}/${res.favicon.replace('storage/', '')}` : null;
        }
      },
      error: (err) => {
        console.error('Failed to load site details', err);
      }
    });
  }

  onImageSelected(event: any, type: 'logo' | 'favicon') {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire('Invalid File', 'Only image files are allowed.', 'error');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('File Too Large', 'Image must be under 2MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'logo') {
          this.logo = file;
          this.logoPreview = reader.result as string;
        } else {
          this.favicon = file;
          this.faviconPreview = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(type: 'logo' | 'favicon') {
    if (type === 'logo') {
      this.logo = null;
      this.logoPreview = null;
      const input = document.getElementById('file-logo') as HTMLInputElement;
      if (input) input.value = '';
    } else {
      this.favicon = null;
      this.faviconPreview = null;
      const input = document.getElementById('file-favicon') as HTMLInputElement;
      if (input) input.value = '';
    }
  }

  submitSiteDetails() {
    const missing: string[] = [];


    if (!this.logo) missing.push('Logo');
    if (!this.favicon) missing.push('Favicon');
    if (!this.formData.phone1.trim()) missing.push('Phone 1');
    if (!this.formData.email.trim()) missing.push('Email');
    if (!this.formData.address.trim()) missing.push('Address');

    if (missing.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        html: `<b>Please complete the following:</b><br>${missing.join('<br>')}`
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

    Object.entries(this.formData).forEach(([key, value]) => {
      data.append(key, value.trim());
    });

    if (this.logo) data.append('logo', this.logo);
    if (this.favicon) data.append('favicon', this.favicon);

    this.http.post(`${environment.apiUrl}/sitedetails`, data, { headers }).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess = true;

        setTimeout(() => {
          this.showSuccess = false;
          this.router.navigate(['/sitedetails']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error', 'Failed to submit site details.', 'error');
        console.error(err);
      }
    });
  }
}
