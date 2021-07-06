import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { CurrencyService } from "../service/currency.service";
import { MatDialog } from "@angular/material/dialog";
import { AddOperationModalComponent } from "./add-operation-modal/add-operation-modal.component";
import { lastValueFrom } from "rxjs";
import { ChartOptions, ChartType } from "chart.js";
import { Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, SingleDataSet } from "ng2-charts";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, AfterViewInit {

  // chart
  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'bottom'
    },
    animation: {
      duration: 2000,
      easing: "easeInBounce"
    }
  };
  
  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'doughnut';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  public chartColors: any[] = [
    { 
      backgroundColor:[
        "#F72585", 
        "#4361EE",
        "#B5179E",
        "#3A0CA3",
        "#4895EF",
        "#3F37C9",
        "#560BAD",
        "#4CC9F0",
        "#7209B7",
        "#480CA8",
      ],
      borderColor: [
        "#F72585", 
        "#4361EE",
        "#B5179E",
        "#3A0CA3",
        "#4895EF",
        "#3F37C9",
        "#560BAD",
        "#4CC9F0",
        "#7209B7",
        "#480CA8",
    ],
    }
  ];
  // chart

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
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }
  
  ngOnInit() {
    this.getOperations()
    this.getResumes()
    
    setInterval(() => {
      this.dataSource.data.forEach((value , index) => {
        this.currencyService.getCurrencies(value.asset).subscribe(result => {
          if (value.currentPrice > result.price) {
            value.priceStyle = true
          } else {
            value.priceStyle = false
          }
          value.currentPrice = result.price
          value.currentValue = value.totalQuantity * result.price
        })
      })
    }, 2000);
  }
  
  ngAfterViewInit() {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddOperationModalComponent, {
      disableClose: true,
      width: "250px",
      data: {},
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.value) {
        console.log('condição 1')
        const { value: form } = result;
        const currency$ = this.currencyService.getCurrencies(form.asset);
        const { price } =  await lastValueFrom(currency$);
        if (!this.dataSource.data.length) {
          console.log('nenhum resumo encontrado')
          this.currencyService.postOperationByFirebase(form, '1');
          const newResume = this.mountNewResume(form, price);
          console.log(newResume);
          this.currencyService.postResumesByFirebase(newResume);
        } else {
          console.log('resumos encontrados')
          const resumeAlreadyExists = this.mountResumeAlreadyExists(form, price)
          this.currencyService.postOperationByFirebase(form, '2');
          const findCoin = this.dataSource.data.find(resume => {
            return resume.asset === form.asset
          })
          if (findCoin) {
            this.currencyService.updateResumesByFirebase(findCoin.key, resumeAlreadyExists)
          } else {
            console.log('MOEDA NÃO ENCONTRADA', '😒');
            const newResume = this.mountNewResume(form, price);
            this.currencyService.postResumesByFirebase(newResume);
          }
        }
      }
    })
  }

  calculatePm(form) {
    console.log('pm', form)
    return form.valueInvest / form.quantity
  }

  calculateCurrentValue(form) {
    console.log('currentValue', form)
    return (form.quantity * form.valueInvest)
  }

  mountNewResume(form, price) {
    console.log(form)
    const newResume = {
      asset: form.asset,
      currentPrice: +price,
      pm: this.calculatePm(form),
      totalQuantity: form.quantity,
      priceStyle: false,
      valueInvestTotal: form.valueInvest,
      currentValue: this.calculateCurrentValue(form),
      lp: 20100,
      variation: 511
    }
    console.log('RESUMO MONTADO', newResume)
    return newResume
  }

  mountResumeAlreadyExists(form, price) {
    console.log('mountResumeAlreadyExists from', form)
    // console.log(this.operations)
    const operationByAsset = this.operations.filter(operation => {
      return operation.asset === form.asset
    })
    const totalInvest = operationByAsset.reduce((acc, operation) => {
      return acc + +operation.valueInvest
    },0)
    const totalQuantity = operationByAsset.reduce((acc, operation) => {
      return acc + +operation.quantity
    },0)

    // console.log('operationByAsset',operationByAsset)
    // console.log('totalInvest',totalInvest)
    // console.log('totalQuantity',totalQuantity)
    if (operationByAsset.length) {
      const resumeAlreadyExists = {
        asset: form.asset,
        currentPrice: price,
        priceStyle: false,
        pm: (totalInvest + form.valueInvest) / (totalQuantity + form.quantity),
        totalQuantity: totalQuantity + form.quantity,
        valueInvestTotal: totalInvest + form.valueInvest,
        currentValue: (totalQuantity + form.valueInvest) * price,
        lp: 20100,
        variation: 511
      }
      console.log('RESUMO SOMADO AOS EXISTENTES 1', resumeAlreadyExists)
      return resumeAlreadyExists
    } else {
      console.log('NOVA CONDIÇÃO')
    }

  }

  getImage(element) {
    switch (element.asset) {
      case 'BTCUSDT':
        return "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png"
      case 'ADAUSDT':
        return "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png"
      case 'ETHUSDT':
        return "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"
      case 'BNBUSDT':
        return "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"
      case 'ONEUSDT':
        return "https://s2.coinmarketcap.com/static/img/coins/64x64/3945.png"
      case 'YFIUSDT':
        return "https://s2.coinmarketcap.com/static/img/coins/64x64/5864.png"
      case 'CKBUSDT':
        return "https://s2.coinmarketcap.com/static/img/coins/64x64/4948.png"
      case '1INCHUSDT':
      return "https://s2.coinmarketcap.com/static/img/coins/64x64/8104.png"
    }
  }

  findCoinOnResumes(sources: any, { asset }) {
    const founded = sources.find(el => el.asset === asset)
    return { result: !!founded, coin: founded }
  }

  getResumes() {
    this.currencyService.getResumesByFirebase().subscribe((res: any) => {
      console.log(res)
      this.dataSource.data = res

      const sumTotal = this.dataSource.data.reduce((acc, resume) => {
        return acc + +resume.valueInvestTotal
      }, 0)
      console.log(sumTotal)
      
      this.dataSource.data.map(a => {
        const ratio = (a.valueInvestTotal / sumTotal) * 100
        this.pieChartLabels.push(a.asset)
        this.pieChartData.push(Math.round(ratio))
      }) 
      console.log(this.pieChartLabels)
      console.log(this.pieChartData)
    })
  }

  getOperations() {
    this.currencyService.getOperationsByFirebase().subscribe(operations => {
      // console.log('OPERATIONS', operations)
      if(operations.length) {
        this.operations = operations
        this.hasOperations = !!this.operations.length
      }
    })
  }

}

