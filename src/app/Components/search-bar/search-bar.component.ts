import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  @Input() placeholder = 'ابحث عن الخدمة التي تريدها...';
  @Output() searchChange = new EventEmitter<string>();

  query = '';

  onInput(): void {
    this.searchChange.emit(this.query);
  }

  clear(): void {
    this.query = '';
    this.searchChange.emit('');
  }
}
