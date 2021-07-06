import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormGroup, FormBuilder } from "@angular/forms";
import { CurrencyService } from "src/app/service/currency.service";
import { lastValueFrom } from "rxjs";

@Component({
  selector: "app-add-operation-modal",
  templateUrl: "./add-operation-modal.component.html",
  styleUrls: ["./add-operation-modal.component.scss"],
})
export class AddOperationModalComponent implements OnInit {
  formOperation: FormGroup;

  assets: any[] = [
    {value: '1', viewValue: 'BTCUSDT'},
    {value: '2', viewValue: 'ETHUSDT'},
    {value: '3', viewValue: 'ADAUSDT'},
    {value: '4', viewValue: 'BNBUSDT'},
    {value: '5', viewValue: 'YFIUSDT'},
    {value: '6', viewValue: 'ONEUSDT'},
    {value: '7', viewValue: 'CKBUSDT'}
  ];

  constructor(
    private formBuilder: FormBuilder, public currencyService: CurrencyService,
    public dialogRef: MatDialogRef<AddOperationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.createForm();
    // this.fillValueInvest();
  }
  
  createForm() {
    this.formOperation = this.formBuilder.group({
      asset: "BTCUSDT",
      date: "08/03/21",
      hour: "12:00",
      valueInvest: "",
      quantity: "",
    });
  }

  async dataChanged(event) {
    console.log(event)
    const asset = this.getValueControl('asset')
    const currency$ = this.currencyService.getCurrencies(asset)
    const { price } =  await lastValueFrom(currency$)
    this.formOperation.get('valueInvest').setValue(price * event)
  }

  getValueControl(field = '') {
    return this.formOperation.get(field).value;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
