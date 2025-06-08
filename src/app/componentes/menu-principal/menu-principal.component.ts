import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { CommonModule } from '@angular/common';
import { VersionModalComponent } from '../modal/version-modal/version-modal.component';
import { ProyectosService } from '../../services/proyectos/proyectos.service';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  templateUrl: './menu-principal.component.html',
  styleUrl: './menu-principal.component.css'
})
export class MenuPrincipalComponent implements OnInit {
  proyectos: any = [];
  showDropdown = false;
  proyectoSeleccionado = "";

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private dialog: MatDialog,
    private proyectosSvc: ProyectosService
  ) {}

  ngOnInit() {
    this.getProyectos();
    this.proyectoSeleccionado = localStorage.getItem('nombrePro') || '';
  }

  getProyectos(): void{
      this.proyectosSvc.getProyectos().subscribe(
        (data)=>{
          this.proyectos = data;
          this.proyectos.reverse(); // Invertir el orden de los proyectos
          console.log(this.proyectos);
        },(error)=>{
          const errorMessage = error.error?.message || 'Error al obtener proyectos';
          console.log(errorMessage);
        }
      )
   }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showDropdown = false;
    }
  }

  seleccionarProyecto(id: number, nombre: string) {
    localStorage.setItem('proyectoId', id.toString());
    localStorage.setItem('nombrePro', nombre);
    this.proyectoSeleccionado = nombre;
    console.log('Proyecto guardado en local storage: ', id);
    this.showDropdown = false;
    this.router.navigate(["diagramas"]);
  }

  iraCU() {
    this.router.navigate(['casosuso']);
  }

  iraClases() {
    this.router.navigate(['clases']);
  }

  iraComponentes() {
    this.router.navigate(['componentes']);
  }

  iraPaquetes() {
    this.router.navigate(['paquetes']);
  }

  iraSecuencias() {
    this.router.navigate(['secuencias']);
  }

  crearProyecto() {
    this.showDropdown = false;
    const dialogRef = this.dialog.open(VersionModalComponent, {
      height: '600px',
      width: '1200px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['proyectos']);
    })
  }
}