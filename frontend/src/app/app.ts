import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Modal } from './shared/components/modal/modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Modal],
  templateUrl: './app.html',
})
export class App {}
