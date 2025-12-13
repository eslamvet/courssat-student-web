import { Component, signal, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-confirm-order',
  imports: [],
  templateUrl: './confirm-order.html',
  styleUrl: './confirm-order.css',
})
export class ConfirmOrder {
  status: Signal<'success' | 'error' | 'pending'>;
  constructor(activatedRoute: ActivatedRoute) {
    this.status = signal(activatedRoute.snapshot.queryParams['status']);
    window.parent.postMessage(
      { confirmOrder: true, status: activatedRoute.snapshot.queryParams['status'] },
      '*'
    );
  }
}
