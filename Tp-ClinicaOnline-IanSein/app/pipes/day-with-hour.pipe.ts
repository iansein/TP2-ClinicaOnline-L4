import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dayWithHour',
})
export class DayWithHourPipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): unknown {
    if (value.seconds) {
      value = new Date(value.seconds * 1000);
    }
    let rtn = '';
    let year = value.getFullYear();
    let month = (value.getMonth() + 1).toString().padStart(2, '0');
    let day = value.getDate().toString().padStart(2, '0');

    let amOrPm = value.getHours() >= 12 ? 'PM' : 'AM';
    let hours = (value.getHours() % 12) || 12;
    let minutes = value.getMinutes().toString().padStart(2, '0');

    rtn = `${year}-${month}-${day} ${hours}:${minutes} ${amOrPm}`;
    return rtn;
  }
}