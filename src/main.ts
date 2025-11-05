import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
// Importamos nuestro nuevo componente en lugar del antiguo
import { TimerComponent } from './app/timer/timer.component';

// Le decimos a Angular que arranque usando TimerComponent
bootstrapApplication(TimerComponent, appConfig)
  .catch((err) => console.error(err));
