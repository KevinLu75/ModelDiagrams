import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RelationData {
  fromKey: number;
  toKey: number;
  type: 'inheritance' | 'association' | 'aggregation' | 'composition' | 'dependency';
  label?: string;
}

@Component({
  selector: 'app-relation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="visible" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-gray-800 p-6 rounded-lg w-96 text-white">
        <h2 class="text-xl mb-4">Crear Relación</h2>
        
        <div class="mb-4">
          <label class="block mb-1">Tipo de Relación</label>
          <select [(ngModel)]="relation.type" class="w-full px-3 py-2 bg-gray-700 rounded text-white">
            <option value="inheritance">Herencia</option>
            <option value="association">Asociación</option>
            <option value="aggregation">Agregación</option>
            <option value="composition">Composición</option>
            <option value="dependency">Dependencia</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block mb-1">Etiqueta (opcional)</label>
          <input [(ngModel)]="relation.label" class="w-full px-3 py-2 bg-gray-700 rounded text-white" placeholder="Etiqueta">
        </div>
        
        <div class="flex justify-between">
          <button (click)="cancelDialog()" class="bg-gray-600 px-4 py-2 rounded">Cancelar</button>
          <button (click)="saveRelation()" class="bg-green-aqua px-4 py-2 rounded">Guardar</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RelationDialogComponent {
  @Input() visible = false;
  @Input() fromKey: number | null = null;
  @Input() toKey: number | null = null;
  @Output() save = new EventEmitter<RelationData>();
  @Output() cancel = new EventEmitter<void>();

  relation: RelationData = {
    fromKey: 0,
    toKey: 0,
    type: 'association',
    label: ''
  };

  ngOnChanges() {
    if (this.visible && this.fromKey !== null && this.toKey !== null) {
      this.relation.fromKey = this.fromKey;
      this.relation.toKey = this.toKey;
      this.relation.type = 'association';
      this.relation.label = '';
    }
  }

  saveRelation() {
    if (this.fromKey !== null && this.toKey !== null) {
      this.save.emit(this.relation);
    }
  }

  cancelDialog() {
    this.cancel.emit();
  }
}