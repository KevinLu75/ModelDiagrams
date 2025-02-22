import { Component } from '@angular/core';
import { ClassDiagramComponent } from "./diagramming/components/class-diagram/class-diagram.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ClassDiagramComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'model-diagrams';
}
