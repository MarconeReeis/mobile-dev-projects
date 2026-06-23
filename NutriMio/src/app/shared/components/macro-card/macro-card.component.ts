import { Component, Input } from '@angular/core';
import { MacroSummary } from '../../../models';

@Component({
  selector: 'app-macro-card',
  templateUrl: './macro-card.component.html',
  styleUrls: ['./macro-card.component.scss'],
})
export class MacroCardComponent {
  @Input({ required: true }) macro!: MacroSummary;
}
