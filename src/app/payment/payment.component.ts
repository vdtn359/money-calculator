import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { IPayment, isValid as isPaymentValid } from '../model/payment';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers';
import { EditPayment, DeletePayment, AddPayment } from '../actions/payment';
import { getPaymentState, getPeopleState } from '../reducers/selectors';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent implements OnInit, OnDestroy {
  isPaymentValid = isPaymentValid;
  payments$: Observable<{ paymentMap: any; payerOptions: any }>;
  subscription: Subscription;
  payments: IPayment[] = [];
  paymentMap = {};
  constructor(private store: Store<AppState>, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    const payments$ = this.store.select(getPaymentState);
    const peoplel$ = this.store.select(getPeopleState);
    this.subscription = combineLatest(payments$, peoplel$).subscribe(
      ([payments, people]) => {
        this.payments = payments;
        this.paymentMap = {};
        const payerOptions = people.map(person => ({
          name: person.name,
          value: person.id,
        }));
        payments.forEach(payment => {
          this.paymentMap[payment.id] = {
            senders: payerOptions.filter(
              payer => payer.value !== payment.receiverId
            ),
            receivers: payerOptions.filter(
              payer => !payment.senderIds.includes(payer.value)
            ),
          };
        });
        this.cd.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addPayment() {
    this.store.dispatch(new AddPayment());
  }

  editPayment(payment) {
    this.store.dispatch(new EditPayment(payment));
  }

  removePayment(payment) {
    this.store.dispatch(new DeletePayment(payment.id));
  }
}
