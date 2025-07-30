import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import { UserOutline, BankOutline } from '@ant-design/icons-angular/icons';
import { provideNzI18n, ru_RU } from 'ng-zorro-antd/i18n';

import { routes } from './app.routes';

const icons: IconDefinition[] = [
  UserOutline,
  BankOutline
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideNzIcons(icons),
    provideNzI18n(ru_RU)
  ]
};
