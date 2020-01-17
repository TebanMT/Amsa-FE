import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule }    from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// used to create fake backend
//import { fakeBackendProvider } from './_helpers/fake-backend';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { MenuComponent } from './components/shared/menu/menu.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { AlertComponent } from './components/alert/alert/alert.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

import { ErrorInterceptor } from './_helpers/error.interceptor';
import { JwtInterceptor, } from "./_helpers/jwt.interceptor";
import { InitialContentComponent } from './components/initial-content/initial-content.component';
import { RegisterUserContentComponent } from './components/register-user-content/register-user-content.component';


const ENTRYCOMPONENTS = [
  InitialContentComponent,
  RegisterUserContentComponent,
];

const COMPONENTS = [AppComponent,
                    HeaderComponent,
                    MenuComponent,
                    FooterComponent,
                    AlertComponent,
                    HomeComponent,
                    LoginComponent,
                    RegisterComponent,
                  ];


@NgModule({
  declarations: [
    COMPONENTS,
    ENTRYCOMPONENTS
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    // provider used to create fake backend
    //fakeBackendProvider
  ],
  bootstrap: [AppComponent],
  entryComponents: [ENTRYCOMPONENTS]
})
export class AppModule { }
