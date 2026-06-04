import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { COLOR_PRESETS, EMOJI_PRESETS } from '../../../../core/constants/habit-presets';
import { Habit, HabitFormValues } from '../../../../core/models/habit.model';
import { toLocalDatetimeInput } from '../../utils/habit.utils';

addIcons({ closeOutline });

@Component({
  selector: 'app-habit-form-modal',
  templateUrl: './habit-form-modal.component.html',
  styleUrls: ['./habit-form-modal.component.scss'],
  imports: [ReactiveFormsModule, IonButton, IonIcon],
})
export class HabitFormModalComponent implements OnInit {
  @Input() initial: Habit | null = null;

  private readonly modalCtrl = inject(ModalController);
  private readonly fb = inject(FormBuilder);

  readonly emojiPresets = EMOJI_PRESETS;
  readonly colorPresets = COLOR_PRESETS;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    emoji: [EMOJI_PRESETS[0] as string, Validators.required],
    color: [COLOR_PRESETS[0] as string, Validators.required],
    startedAt: [toLocalDatetimeInput(Date.now()), Validators.required],
  });

  get isEdit(): boolean {
    return Boolean(this.initial);
  }

  ngOnInit(): void {
    if (!this.initial) {
      return;
    }

    this.form.patchValue({
      name: this.initial.name,
      emoji: this.initial.emoji,
      color: this.initial.color,
      startedAt: toLocalDatetimeInput(this.initial.startedAt),
    });
  }

  selectEmoji(emoji: string): void {
    this.form.controls.emoji.setValue(emoji);
  }

  selectColor(color: string): void {
    this.form.controls.color.setValue(color);
  }

  isEmojiSelected(emoji: string): boolean {
    return this.form.controls.emoji.value === emoji;
  }

  isColorSelected(color: string): boolean {
    return this.form.controls.color.value === color;
  }

  cancel(): void {
    this.modalCtrl.dismiss(undefined, 'cancel');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const startedAt = new Date(raw.startedAt ?? '').getTime();
    const payload: HabitFormValues = {
      name: raw.name?.trim() ?? '',
      emoji: raw.emoji ?? EMOJI_PRESETS[0],
      color: raw.color ?? COLOR_PRESETS[0],
      startedAt: Number.isFinite(startedAt) ? startedAt : Date.now(),
    };

    this.modalCtrl.dismiss(payload, 'confirm');
  }
}
