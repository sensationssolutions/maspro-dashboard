
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

function generateUid() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface ServicePoint {
  uid: string;
  title: string;
  description: string;
  existingImageUrl?: string | null;  // <-- store the backend’s path
  image?: File;                      // <-- for any newly picked file
  preview?: string;                  // <-- full frontend URL for preview
}

@Component({
  selector: 'app-editservice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editservice.html',
  styleUrls: ['./editservice.css']
})
export class Editservice implements OnInit {
  serviceId!: number;
  heading = '';
  servicePoints: ServicePoint[] = [];

  loading = false;
  showSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ){}

  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadService();
  }

  loadService(): void {
    const token = localStorage.getItem('auth_token')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/services/${this.serviceId}`, { headers })
      .subscribe({
        next: res => {
          this.heading = res.title || '';
          const pts = Array.isArray(res.points) ? res.points : JSON.parse(res.points || '[]');
          this.servicePoints = pts.map((p: any) => ({
            uid: generateUid(),
            title: p.title,
            description: p.description,
            existingImageUrl: p.image_url || null,
            preview: p.image_url ? environment.assetsUrl + p.image_url : undefined
          }));
        },
        error: err => console.error(err)
      });
  }

  addPoint(): void {
    this.servicePoints = [
      ...this.servicePoints,
      { uid: generateUid(), title: '', description: '', existingImageUrl: null }
    ];
  }

  removePoint(i: number): void {
    this.servicePoints = this.servicePoints.filter((_, idx) => idx !== i);
  }

  trackByPoint(_idx: number, p: ServicePoint) {
    return p.uid;
  }

  onPointImageChange(event: any, i: number): void {
    const file = event.target.files[0] as File;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.servicePoints[i].preview = reader.result as string;
      this.servicePoints[i].image = file;
    };
    reader.readAsDataURL(file);
  }

  updateService(): void {
    this.loading = true;
    const token = localStorage.getItem('auth_token')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('title', this.heading);

    
    const pointsMeta = this.servicePoints.map(p => ({
      title: p.title,
      description: p.description,
      image_url: p.existingImageUrl || null
    }));
    formData.append('points', JSON.stringify(pointsMeta));

    
    this.servicePoints.forEach((p, idx) => {
      if (p.image) {
        formData.append(`images[${idx}]`, p.image);
      }
    });

    this.http.post(`${environment.apiUrl}/services/${this.serviceId}`, formData, { headers })
      .subscribe({
        next: () => {
          this.loading = false;
          this.showSuccess = true;
          setTimeout(() => {
            this.showSuccess = false;
            this.router.navigate(['/services']);
          }, 1500);
        },
        error: err => {
          this.loading = false;
          console.error(err);
        }
      });
  }
}
