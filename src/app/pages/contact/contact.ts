import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact implements OnInit {

  environment = environment;
  contacts: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchContacts();
  }

  fetchContacts() {
    this.loading = true;
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`${environment.apiUrl}/contacts`, { headers }).subscribe({
      next: (res) => {
        // Sort: Unread first
        this.contacts = res.data.sort((a: any, b: any) => Number(a.status) - Number(b.status));
        this.loading = false;
      },
      error: () => {
        Swal.fire('Error!', 'Failed to load contact messages.', 'error');
        this.loading = false;
      }
    });
  }

  markAsRead(contact: any) {
    if (contact.status) return; // already read

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`${environment.apiUrl}/contacts/${contact.id}`, { status: true }, { headers }).subscribe({
      next: () => {
        contact.status = true;
        Swal.fire({
          icon: 'success',
          title: 'Marked as Read!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500
        });

        // Refresh sort
        this.contacts = [...this.contacts].sort((a: any, b: any) => Number(a.status) - Number(b.status));
      },
      error: () => {
        Swal.fire('Error!', 'Could not update status.', 'error');
      }
    });
  }
}
