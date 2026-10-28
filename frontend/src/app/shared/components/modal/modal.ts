import { Component, inject } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
})
export class Modal {
  modalService = inject(ModalService);
}
