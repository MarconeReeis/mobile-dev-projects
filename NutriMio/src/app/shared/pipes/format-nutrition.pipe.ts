import { Pipe, PipeTransform } from '@angular/core';
import { formatNutritionValue } from '../../core/utils/meal.utils';

@Pipe({
  name: 'nutrition',
  standalone: true,
})
export class FormatNutritionPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) {
      return '0';
    }

    return formatNutritionValue(value);
  }
}
