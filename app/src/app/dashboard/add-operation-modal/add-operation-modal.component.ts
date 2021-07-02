import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: "app-add-operation-modal",
  templateUrl: "./add-operation-modal.component.html",
  styleUrls: ["./add-operation-modal.component.css"],
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
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddOperationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.createForm();
    console.log("valor formulario", this.formOperation.value);
  }

  createForm() {
    this.formOperation = this.formBuilder.group({
      asset: "BTCUSDT",
      date: "08/03/21",
      hour: "12:00",
      valueInvest: 20,
      quantity: 60,
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
