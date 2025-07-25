import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './slider.html',
  styleUrl: './slider.css'
})
export class Slider implements OnInit {

  environment = environment;
  sliders: any[] = [];
  currentPage = 1;
  lastPage = 1;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchSliders();
  }

  fetchSliders(page: number = 1) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('page', page.toString());

    this.http.get<any>(`${environment.apiUrl}/sliders`, { headers, params }).subscribe({
      next: (res) => {
        this.sliders = res.data;
        this.currentPage = res.current_page;
        this.lastPage = res.last_page;
      },
      error: (err) => {
        console.error('Failed to load sliders:', err);
      }
    });
  }

  deleteSlider(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This slider and image will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete<any>(`${environment.apiUrl}/sliders/${id}`, { headers }).subscribe({
          next: () => {
            this.sliders = this.sliders.filter(s => s.id !== id);
            Swal.fire({
              title: 'Deleted!',
              text: 'Slider deleted successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete the slider.', 'error');
          }
        });
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.fetchSliders(page);
    }
  }
}
