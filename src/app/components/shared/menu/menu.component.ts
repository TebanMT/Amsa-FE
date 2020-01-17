import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthenticationService } from '../../../_services/authentication.service';

import { InitialContentComponent } from "../../initial-content/initial-content.component";
import { RegisterUserContentComponent } from "../../register-user-content/register-user-content.component";

import { User } from '../../../_models/user';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styles: []
})
export class MenuComponent implements OnInit, OnDestroy {
  @ViewChild('figureContainer', {static: true,read: ViewContainerRef}) figureContainer;
  activeTab = 0;
  menu = [
        {
          title: 'ADMIN',
          content:[
          {
            title: 'Home',
            component: InitialContentComponent
          },
          {
            title: 'Registrar Usuarios',
            component: RegisterUserContentComponent
          },
        ]
        },
  ]
  users: User[] = [];
  currentUser: User;
  currentUserSubscription: Subscription;

  constructor(private authenticationService: AuthenticationService,
    private router: Router,private componentFactoryResolver: ComponentFactoryResolver,) { }

  ngOnInit() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(this.menu[0].content[0].component);
    this.figureContainer.createComponent(factory)
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

  changeTab(pos) {
    console.log(pos)
    this.activeTab = pos;
    this.figureContainer.clear();
    const factory = this.componentFactoryResolver.resolveComponentFactory(pos.component);
    const componentRef = this.figureContainer.createComponent(factory)
    componentRef.changeDetectorRef.detectChanges();
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
}

}
