import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-redirect-popup',
  templateUrl: 'redirect-popup.component.html',
})
export class RedirectPopupComponent {

  constructor(
    public popupRef: MatDialogRef<RedirectPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

}
