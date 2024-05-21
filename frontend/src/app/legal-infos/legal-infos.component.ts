import { Component, ElementRef, HostListener, ViewChild, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../common.service';

@Component({
  selector: 'app-legal-infos',
  standalone: true,
  imports: [],
  templateUrl: './legal-infos.component.html'
})
export class LegalInfosComponent implements OnInit {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private commonService: CommonService) {
  }
}
