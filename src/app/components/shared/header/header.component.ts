import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../_services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
}

}
