import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PomodoroService, PomodoroConfig } from '../../services/pomodoro.service';
import { LucideAngularModule, Settings, X, Save } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  protected pomodoroService = inject(PomodoroService);
  
  protected readonly SettingsIcon = Settings;
  protected readonly XIcon = X;
  protected readonly SaveIcon = Save;

  protected isOpen = signal(false);
  
  protected workDuration = signal(25);
  protected shortBreakDuration = signal(5);
  protected longBreakDuration = signal(15);
  protected sessionsBeforeLongBreak = signal(4);

  constructor() {
    // Inicializar con los valores actuales del servicio
    const currentConfig = this.pomodoroService.config();
    this.workDuration.set(currentConfig.workDuration);
    this.shortBreakDuration.set(currentConfig.shortBreakDuration);
    this.longBreakDuration.set(currentConfig.longBreakDuration);
    this.sessionsBeforeLongBreak.set(currentConfig.sessionsBeforeLongBreak);
  }

  openModal(): void {
    // Actualizar valores con la configuración actual
    const currentConfig = this.pomodoroService.config();
    this.workDuration.set(currentConfig.workDuration);
    this.shortBreakDuration.set(currentConfig.shortBreakDuration);
    this.longBreakDuration.set(currentConfig.longBreakDuration);
    this.sessionsBeforeLongBreak.set(currentConfig.sessionsBeforeLongBreak);
    
    this.isOpen.set(true);
  }

  closeModal(): void {
    this.isOpen.set(false);
  }

  saveSettings(): void {
    const newConfig: PomodoroConfig = {
      workDuration: this.workDuration(),
      shortBreakDuration: this.shortBreakDuration(),
      longBreakDuration: this.longBreakDuration(),
      sessionsBeforeLongBreak: this.sessionsBeforeLongBreak()
    };

    this.pomodoroService.updateConfig(newConfig);
    this.closeModal();
  }

  // Métodos para validación
  validateMinutes(value: number): number {
    return Math.max(1, Math.min(60, Math.floor(value)));
  }

  validateSessions(value: number): number {
    return Math.max(1, Math.min(10, Math.floor(value)));
  }

  onWorkDurationChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.workDuration.set(this.validateMinutes(value));
  }

  onShortBreakChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.shortBreakDuration.set(this.validateMinutes(value));
  }

  onLongBreakChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.longBreakDuration.set(this.validateMinutes(value));
  }

  onSessionsChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.sessionsBeforeLongBreak.set(this.validateSessions(value));
  }

  // Keyboard navigation
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}
