import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    title: 'Nic P The Barber',
  },
  {
    path: 'gallery',
    loadComponent: () => import('./features/gallery/gallery').then(m => m.Gallery),
    title: 'Gallery | Nic P The Barber',
  },
  {
    path: 'reservations',
    loadComponent: () => import('./features/reservations/reservations').then(m => m.Reservations),
    title: 'Book a Cut | Nic P The Barber',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
