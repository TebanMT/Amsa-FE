import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterSuppliers'
})
export class FilterSuppliersPipe implements PipeTransform {

  transform(items: any[], searchText: string, propertyName): any[] {
    console.log(items, searchText, propertyName)
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter(item => {
      return item[propertyName] && item[propertyName].toLowerCase().includes(searchText);
    });
  }

}
