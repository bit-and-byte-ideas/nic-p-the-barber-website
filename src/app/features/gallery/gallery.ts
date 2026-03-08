import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';

type Category = 'all' | 'fades' | 'beards' | 'styles';

interface GalleryItem {
  id: number;
  category: Exclude<Category, 'all'>;
  label: string;
}

@Component({
  selector: 'app-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  readonly categories: { label: string; value: Category }[] = [
    { label: 'All', value: 'all' },
    { label: 'Fades', value: 'fades' },
    { label: 'Beards', value: 'beards' },
    { label: 'Styles', value: 'styles' },
  ];

  readonly items: GalleryItem[] = [
    { id: 1, category: 'fades', label: 'Low Fade' },
    { id: 2, category: 'beards', label: 'Full Beard Shaping' },
    { id: 3, category: 'styles', label: 'Classic Taper' },
    { id: 4, category: 'fades', label: 'High Fade' },
    { id: 5, category: 'styles', label: 'Textured Crop' },
    { id: 6, category: 'beards', label: 'Line-Up & Beard' },
    { id: 7, category: 'fades', label: 'Skin Fade' },
    { id: 8, category: 'styles', label: 'Pompadour Taper' },
    { id: 9, category: 'beards', label: 'Short Beard Trim' },
  ];

  activeCategory = signal<Category>('all');

  filteredItems = computed(() => {
    const cat = this.activeCategory();
    return cat === 'all' ? this.items : this.items.filter(i => i.category === cat);
  });

  setCategory(cat: Category) {
    this.activeCategory.set(cat);
  }
}
