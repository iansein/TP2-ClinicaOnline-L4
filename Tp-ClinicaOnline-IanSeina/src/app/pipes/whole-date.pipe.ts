import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wholeDate',
})
export class WholeDatePipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): unknown {
    let year = value.getFullYear();
    let month = (value.getMonth() + 1).toString().padStart(2, '0');
    let day = value.getDate().toString().padStart(2, '0');
    let hours = value.getHours().toString().padStart(2, '0');
    let minutes = value.getMinutes().toString().padStart(2, '0');
    let seconds = value.getSeconds().toString().padStart(2, '0');

    let rtn = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    return rtn;
  }
}