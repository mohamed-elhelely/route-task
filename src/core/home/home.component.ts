import { Component, OnInit } from '@angular/core';
import { DataService } from '../../app/data.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
export interface Customer {
  id: number;
  name: string;
  transactions: Transaction[]; // Optional array to hold transactions
}

export interface Transaction {
  id: number;
  customer_id: number;
  date: Date; // Should be Date type if you're using dates
  amount: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  columnsToDisplay: string[] = ['id', 'name'];
  displayedColumns: string[] = ['id', 'amount', 'date'];
  expandedElement: any | null;
  dataSource = new MatTableDataSource();
  customersData: Customer[] = [];
  transactions: Transaction[] = [];
  constructor(private dataService: DataService) {
    this.dataSource.filterPredicate = ((data: Customer, filter: string): boolean => {
      const transformedFilter = filter.trim().toLowerCase();
      const matchCustomerName = data.name.toLowerCase().includes(transformedFilter);

      const matchTransaction = data.transactions.some(transaction =>
        transaction.amount.toString().includes(transformedFilter)
      );

      return matchCustomerName || matchTransaction;
    }) as (data: any, filter: string) => boolean;
  }

  ngOnInit(): void {
    this.getData();

  }

  getData(): void {
    // Fetch customers
    this.dataService.getCustomerData().subscribe(customers => {
      this.customersData = customers;
      // After fetching customers, link transactions

    });

    // Fetch transactions
    this.dataService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
      this.linkTransactions();
    });

  }

  linkTransactions(): void {
    this.customersData.forEach(customer => {
      customer.transactions = []
      this.transactions.forEach(transaction => {
        if (customer.id == transaction.customer_id) {
          console.log(transaction);
          customer.transactions.push(transaction)
        }
      });
      console.log(this.customersData);

      this.dataSource.data = this.customersData;
    })
  }


  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}


