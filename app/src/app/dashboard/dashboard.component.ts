import { Component, OnInit, ViewChild, AfterViewInit, ComponentFactoryResolver } from "@angular/core";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { CurrencyService } from "../service/currency.service";
import { MatDialog } from "@angular/material/dialog";
import * as uuid from "uuid";
import { AddOperationModalComponent } from "./add-operation-modal/add-operation-modal.component";
import { lastValueFrom } from "rxjs";
import { DataSource } from "@angular/cdk/table";
import { Observable } from "rxjs";
import { nanoid } from 'nanoid';
import { throwToolbarMixedModesError } from "@angular/material/toolbar";


@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  price: 0;
  qtdTotal;
  displayedColumns: string[] = [
    "asset",
    "currentPrice",
    "pm",
    "totalQuantity",
    "valueInvestTotal",
    "currentValue",
    "lp",
    "variation",
  ];
  dataSource = new MatTableDataSource<any>();
  operations = [];
  dataForm;
  currentPrice;

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  animal: string;
  name: string;
  hasOperations = false;
  styleUpDown;

  constructor(
    public currencyService: CurrencyService,
    public dialog: MatDialog
  ) {
  }
  
  ngOnInit() {
    this.getOperations()
    this.getResumes()

    setInterval(() => {
      this.dataSource.data.forEach((value , index) => {
        this.currencyService.getCurrencies(value.asset).subscribe(result => {
          if (value.currentPrice > result.price) {
            console.log('menor')
            value.priceStyle = true
          } else {
            console.log('maior')
            value.priceStyle = false
          }
          value.currentPrice = result.price
          value.currentValue = value.totalQuantity * result.price
        })
      })
    }, 5000);
  }
  
  ngAfterViewInit() {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddOperationModalComponent, {
      width: "250px",
      data: {},
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      const currency$ = this.currencyService.getCurrencies(result.value.asset)
      const { price } =  await lastValueFrom(currency$)
      const { value: form } = result
      
      this.currencyService.getOperationsByFirebase().subscribe((operations) => {
        this.operations = operations
      })
        /**
         * TO DO:
         * CONSOLE EM OPERAÇÕES VEM O QUE?: QUANDO NÃO TEM REGISTRO VEM NULO
         * SE FOR NULO EU TENHO QUE CRIAR UMA OPERAÇÃO (POST)
         */

        /**
         * PARA POSTAR UMA NOVA ORDEM É PRECISO QUE O POST SEJA DIFERENTE
         * PASSANFDO APENAS OS DADOS DO FORMULARIO E NÃO O SOMATORIO QUE NAO EXISTE
         */
        if(this.operations.length == 0) {
          console.log('ADICONADO NOVO', this.operations)
          const newResume = {
              asset: form.asset,
              currentPrice: price,
              pm: form.valueInvest / form.quantity,
              totalQuantity: form.quantity,
              priceStyle: false,
              valueInvestTotal: form.valueInvest,
              currentValue: form.quantity * form.valueInvest,
              lp: 20100,
              variation: 511
          }
          this.currencyService.postOperationByFirebase(result.value);
          this.currencyService.postResumesByFirebase(newResume);
          this.getResumes()
          return;
        } else {
          console.log('SOMADO AO EXISTENTE')
          const valueInvestForm = +form.valueInvest
          const totalQuantityForm = +form.quantity
          console.log('operations', this.operations)
          const totalInvest = this.operations.reduce((acc, operation) => {
            return acc + +operation.valueInvest
          },0)
          const totalQuantity = this.operations.reduce((acc, operation) => {
            return acc + +operation.quantity
          },0)

          const totalResume = {
            asset: form.asset,
            currentPrice: price,
            priceStyle: false,
            pm: (totalInvest + valueInvestForm) / (totalQuantity + totalQuantityForm),
            totalQuantity: totalQuantity + totalQuantityForm,
            valueInvestTotal: totalInvest + valueInvestForm,
            currentValue: (totalQuantity + totalQuantityForm) * price,
            lp: 20100,
            variation: 511
          }
          /**
           * SE A EXISTIR UM RESUMO QUE TENHA O MESMO NOME DO QUE ESTÁ SENDO ADICONADO AGORA
           * DEVE SER FEITO UPDATE
           */
          const findCoin = this.dataSource.data.find(resume => {
            return resume.asset === form.asset
          })
          console.log('ENCONTRADO', findCoin)
          if (findCoin) {
            console.log('update', totalResume)
            this.currencyService.updateResumesByFirebase(findCoin.key, totalResume);
            this.getResumes()
          } else {
            this.currencyService.postResumesByFirebase(totalResume);
            this.getResumes()
          }
        }
      
    }, (err)=> { console.log(err) });
  }

  findCoinOnResumes(sources: any, { asset }) {
    const founded = sources.find(el => el.asset === asset)
    return { result: !!founded, coin: founded }
  }

  getResumes() {
    this.currencyService.getResumesByFirebase().subscribe(res => {
      console.log('RESUMOS', res)
      this.dataSource.data = res
      res
    })
  }

  getOperations() {
    this.currencyService.getOperationsByFirebase().subscribe(operations => {
      console.log('OPERATIONS', operations)
      if(operations.length) {
        this.operations = operations
        this.hasOperations = !!this.operations.length
      }
    })
  }

}

