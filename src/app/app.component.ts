import { Component } from '@angular/core';
import { ClassDiagramComponent } from "./diagramming/components/class-diagram/class-diagram.component";
import { HomeComponent } from "./diagramming/components/home/home.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'model-diagrams';
}
