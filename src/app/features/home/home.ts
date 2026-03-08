import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Service {
  icon: string;
  name: string;
  description: string;
  price: string;
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly services: Service[] = [
    {
      icon: '✂️',
      name: 'Haircut',
      description: 'Classic cuts, tapers, and fades crafted to your style.',
      price: 'From $30',
    },
    {
      icon: '🪒',
      name: 'Beard Trim',
      description: 'Line-ups, trims, and full beard shaping done right.',
      price: 'From $20',
    },
    {
      icon: '💈',
      name: 'Haircut & Beard',
      description: 'The full treatment — look sharp from head to chin.',
      price: 'From $45',
    },
  ];
}
