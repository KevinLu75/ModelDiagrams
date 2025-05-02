import { Routes } from '@angular/router';
import { ClassDiagramComponent } from './diagramming/components/class-diagram/class-diagram.component';
import { HomeComponent } from './diagramming/components/home/home.component';
import { ComponentsDiagramComponent } from './diagramming/components/components-diagram/components-diagram.component';
import { PackagesDiagramComponent } from './diagramming/components/packages-diagram/packages-diagram.component';
import { SequenceDiagramComponent } from './diagramming/components/sequence-diagram/sequence-diagram.component';
import { UsecaseDiagramComponent } from './diagramming/components/usecase-diagram/usecase-diagram.component';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'class-diagram', component: ClassDiagramComponent},
    {path: 'components-diagram', component: ComponentsDiagramComponent},
    {path: 'packages-diagram', component: PackagesDiagramComponent},
    {path: 'sequence-diagram', component: SequenceDiagramComponent},
    {path: 'use-case-diagram', component: UsecaseDiagramComponent}
];
