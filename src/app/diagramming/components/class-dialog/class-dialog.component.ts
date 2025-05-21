import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ClassData {
  name: string;
  attributes: string[];
  methods: string[];
}

@Component({
  selector: 'app-class-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="visible" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-gray-800 p-6 rounded-lg w-96 text-white">
        <h2 class="text-xl mb-4">{{ isEdit ? 'Editar' : 'Crear' }} Clase</h2>
        
        <div class="mb-4">
          <label class="block mb-1">Nombre de la Clase</label>
          <input [(ngModel)]="tempClass.name" class="w-full px-3 py-2 bg-gray-700 rounded text-white" placeholder="Nombre de la clase">
        </div>
        
        <div class="mb-4">
          <label class="block mb-1">Atributos</label>
          <div *ngFor="let attr of tempClass.attributes; let i = index" class="flex mb-2">
            <input [(ngModel)]="tempClass.attributes[i]" class="flex-1 px-3 py-2 bg-gray-700 rounded-l text-white">
            <button (click)="removeAttribute(i)" class="bg-red-500 px-3 py-2 rounded-r">×</button>
          </div>
          <button (click)="addAttribute()" class="bg-green-aqua px-3 py-1 rounded text-sm w-full">+ Añadir Atributo</button>
        </div>
        
        <div class="mb-4">
          <label class="block mb-1">Métodos</label>
          <div *ngFor="let method of tempClass.methods; let i = index" class="flex mb-2">
            <input [(ngModel)]="tempClass.methods[i]" class="flex-1 px-3 py-2 bg-gray-700 rounded-l text-white">
            <button (click)="removeMethod(i)" class="bg-red-500 px-3 py-2 rounded-r">×</button>
          </div>
          <button (click)="addMethod()" class="bg-green-aqua px-3 py-1 rounded text-sm w-full">+ Añadir Método</button>
        </div>
        
        <div class="flex justify-between">
          <button (click)="cancelDialog()" class="bg-gray-600 px-4 py-2 rounded">Cancelar</button>
          <button (click)="saveClass()" class="bg-green-aqua px-4 py-2 rounded">Guardar</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ClassDialogComponent {
  @Input() visible = false;
  @Input() isEdit = false;
  @Input() classData: ClassData = { name: '', attributes: [], methods: [] };
  @Output() save = new EventEmitter<ClassData>();
  @Output() cancel = new EventEmitter<void>();

  tempClass: ClassData = { name: '', attributes: [], methods: [] };

  ngOnChanges() {
    if (this.visible) {
      this.tempClass = JSON.parse(JSON.stringify(this.classData));
      if (this.tempClass.attributes.length === 0) {
        this.tempClass.attributes = ['- attribute: type'];
      }
      if (this.tempClass.methods.length === 0) {
        this.tempClass.methods = ['+ method(): returnType'];
      }
    }
  }

  addAttribute() {
    this.tempClass.attributes.push('- newAttribute: type');
  }

  removeAttribute(index: number) {
    this.tempClass.attributes.splice(index, 1);
  }

  addMethod() {
    this.tempClass.methods.push('+ newMethod(): returnType');
  }

  removeMethod(index: number) {
    this.tempClass.methods.splice(index, 1);
  }

  saveClass() {
    this.save.emit(this.tempClass);
  }

  cancelDialog() {
    this.cancel.emit();
  }
}