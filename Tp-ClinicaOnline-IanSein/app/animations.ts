import {
  trigger,
  transition,
  style,
  query,
  group,
  animateChild,
  animate,
} from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('Login => Home', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
      }),
    ]),
    query(':enter', [style({ right: '-100%' })]),
    query(':leave', animateChild()),
    group([
      query(':leave', [animate('1000ms ease-out', style({ right: '100%' }))]),
      query(':enter', [animate('1000ms ease-out', style({ right: '0%' }))]),
    ]),
    query(':enter', animateChild()),
  ]),
  transition('* => Login', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
      }),
    ]),
    query(':enter', [style({ right: '-100%' })]),
    query(':leave', animateChild()),
    group([
      query(':leave', [animate('1000ms ease-out', style({ right: '100%' }))]),
      query(':enter', [animate('1000ms ease-out', style({ right: '0%' }))]),
    ]),
    query(':enter', animateChild()),
  ]),
  transition('Registro => Home', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ]),
    query(':enter', [style({ top: '-100%' })]),
    query(':leave', animateChild()),
    group([
      query(':leave', [animate('1000ms ease-out', style({ right: '100%' }))]),
      query(':enter', [animate('1000ms ease-out', style({ right: '0%' }))]),
    ]),
    query(':enter', animateChild()),
  ]),
  transition('* => Registro', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '100%',
      }),
    ]),
    query(':enter', [style({ right: '-100%' })]),
    query(':leave', animateChild()),
    group([
      query(':leave', [animate('1000ms ease-out', style({ right: '100%' }))]),
      query(':enter', [animate('1000ms ease-out', style({ right: '0%' }))]),
    ]),
    query(':enter', animateChild()),
  ]),
]);