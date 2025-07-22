import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripHtml',
  standalone: true
})
export class StripHtmlPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/<[^>]*>/g, '');
  }
} 