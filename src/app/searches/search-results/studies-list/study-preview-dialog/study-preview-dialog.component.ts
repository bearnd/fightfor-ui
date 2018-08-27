import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';


interface DialogDataInterface {
  studyId: number
}


@Component({
  selector: 'app-study-preview-dialog',
  templateUrl: './study-preview-dialog.component.html',
  styleUrls: ['./study-preview-dialog.component.scss'],
})
export class StudyPreviewDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<StudyPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData: DialogDataInterface,
  ) {}

  ngOnInit() {}

  onClose() {
    this.dialogRef.close();
  }
}
