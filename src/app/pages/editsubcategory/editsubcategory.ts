import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxEditorModule } from 'ngx-editor';
import { Editor } from 'ngx-editor';

@Component({
  selector: 'app-editsubcategory',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule],
  templateUrl: './editsubcategory.html',
  styleUrls: ['./editsubcategory.css']
})
export class Editsubcategory implements OnInit {
  subcategoryId: string = '';
  formData = {
    name: '',
    slug: '',
    title: '',
    description: '',
    category_id: null as number | null,
    status: true,
    specifications: {} as { [key: string]: string }
  };
  categories: any[] = [];
  loading = false;

  slugEdited = false;
  categoriesLoaded = false;
  subcategoryLoaded = false;
  subcategoryCategoryId: number | null = null;

  specificationOptions: { [key: string]: string[] } = {};
  objectKeys = Object.keys;

  descriptionEditor!: Editor;
  toolbar: any = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['align_left', 'align_center', 'align_right'],
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subcategoryId = this.route.snapshot.params['id'];
    this.fetchCategories();
    this.fetchSubcategory();
    this.descriptionEditor = new Editor();
  }

  ngOnDestroy(): void {
    this.descriptionEditor?.destroy();
  }

  fetchCategories() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/categories`, { headers })
      .subscribe({
        next: (res) => {
          this.categories = res.data || res;
          this.categoriesLoaded = true;
          this.trySetCategoryId();
        },
        error: (err) => {
          console.error('Failed to fetch categories:', err);
          Swal.fire('Error', 'Failed to load categories', 'error');
        }
      });
  }

  onNameChange() {
    if (!this.slugEdited) {
      this.formData.slug = this.generateSlug(this.formData.name);
    }
  }

  onSlugChange() {
    this.slugEdited = true;
  }

  private generateSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/--+/g, '-');
  }

  fetchSubcategory() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/sub-categories/${this.subcategoryId}`, { headers })
      .subscribe({
        next: (res) => {
          let specs = res.specifications
            ? (typeof res.specifications === 'string'
                ? JSON.parse(res.specifications)
                : res.specifications)
            : {};
          this.specificationOptions = specs;
          // Set selected value for each key (single select: first value)
          const selectedSpecs: any = {};
          Object.keys(specs).forEach(key => {
            selectedSpecs[key] = Array.isArray(specs[key]) ? specs[key][0] : specs[key];
          });
          this.formData = {
            name: res.name,
            title: res.title,
            slug: res.slug || this.generateSlug(res.name),
            description: res.description || '',
            category_id: null,
            status: res.status,
            specifications: selectedSpecs
          };
          this.subcategoryCategoryId = res.category_id != null ? +res.category_id : null;
          this.subcategoryLoaded = true;
          this.trySetCategoryId();
        },
        error: (err) => {
          console.error('Failed to fetch sub-category:', err);
          Swal.fire('Error', 'Failed to load sub-category details', 'error');
          this.router.navigate(['/subcategories']);
        }
      });
  }

  trySetCategoryId() {
    if (this.categoriesLoaded && this.subcategoryLoaded) {
      this.formData.category_id = this.subcategoryCategoryId;
    }
  }

  updateSubcategory() {
    if (!this.formData.name.trim() || !this.formData.slug.trim() || this.formData.category_id === null) {
      Swal.fire('Error', 'Name, Slug, Title and Category are required', 'error');
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('name', this.formData.name.trim());
    formData.append('slug', this.formData.slug.trim());
    formData.append('title', this.formData.title.trim());
    formData.append('description', this.formData.description.trim());
    if (this.formData.category_id !== null) {
      formData.append('category_id', String(this.formData.category_id));
    }
    formData.append('status', this.formData.status ? '1' : '0');

    // Append specifications in a format PHP can parse into an array
    for (const key in this.formData.specifications) {
      if (Object.prototype.hasOwnProperty.call(this.formData.specifications, key)) {
        // The backend expects each specification value to be an array.
        formData.append(`specifications[${key}][]`, this.formData.specifications[key]);
      }
    }
    
    formData.append('_method', 'PUT'); // Laravel requirement for PUT requests

    this.http.post(`${environment.apiUrl}/sub-categories/${this.subcategoryId}`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Sub-category updated successfully',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/subcategories']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Update failed:', err);
          Swal.fire('Error', 'Failed to update sub-category', 'error');
        }
      });
  }
} 