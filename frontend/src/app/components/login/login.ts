import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  email='';
  password='';

  constructor(private api:ApiService){}

  login(){
    this.api.login({email:this.email,password:this.password})
    .subscribe((res:any)=>{
      localStorage.setItem('token', res.token);
      location.reload();
    });
  }
}