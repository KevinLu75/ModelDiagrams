import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usecase-diagram',
  standalone: true,
  imports: [],
  templateUrl: './usecase-diagram.component.html',
  styleUrl: './usecase-diagram.component.css'
})
export class UsecaseDiagramComponent {
  @ViewChild('diagramDiv', { static: true }) diagramRef!: ElementRef;
  private diagram!: go.Diagram;

  constructor(private router: Router) {}

  goTo(route: string): void {
    this.router.navigate([route]);
  }

  ngOnInit(): void {
    this.initializeDiagram();
  }

  initializeDiagram(): void {
    const $ = go.GraphObject.make;

    this.diagram = $(go.Diagram, this.diagramRef.nativeElement, {
      'undoManager.isEnabled': true,
      layout: $(go.TreeLayout, { angle: 0, layerSpacing: 35 })
    });

    this.diagram.nodeTemplate = $(
      go.Node, 'Auto',
      $(go.Shape, 'Rectangle', {
        fill: '#F3F4F6', stroke: '#4B5563', strokeWidth: 2,
        portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
      }),
      $(
        go.Panel, 'Table', { margin: 8, maxSize: new go.Size(200, NaN) },
        $(go.TextBlock, {
          row: 0, font: 'bold 14px sans-serif', stroke: '#1F2937', margin: new go.Margin(0, 0, 4, 0), editable: true
        }, new go.Binding('text', 'name').makeTwoWay()),

        $(go.Panel, 'Vertical', { row: 1 },
          new go.Binding('itemArray', 'attributes'),
          {
            itemTemplate: $(go.Panel, 'Horizontal',
              $(go.TextBlock, '-', { margin: new go.Margin(0, 4, 0, 0), stroke: '#6B7280' }),
              $(go.TextBlock, { editable: true }, new go.Binding('text').makeTwoWay())
            )
          }
        ),

        $(go.Panel, 'Vertical', { row: 2, margin: new go.Margin(4, 0, 0, 0) },
          new go.Binding('itemArray', 'methods'),
          {
            itemTemplate: $(go.Panel, 'Horizontal',
              $(go.TextBlock, '+', { margin: new go.Margin(0, 4, 0, 0), stroke: '#10B981' }),
              $(go.TextBlock, { editable: true }, new go.Binding('text').makeTwoWay())
            )
          }
        )
      )
    );

    this.diagram.linkTemplate = $(
      go.Link,
      { routing: go.Link.AvoidsNodes, corner: 5, relinkableFrom: true, relinkableTo: true },
      $(go.Shape, { strokeWidth: 2, stroke: '#4B5563' }),
      $(go.Shape, { toArrow: 'Standard', stroke: null, fill: '#4B5563' })
    );

    this.diagram.model = $(go.GraphLinksModel, {
      nodeDataArray: [
        { key: 1, name: 'Person', attributes: ['- name: string', '- age: number'], methods: ['+ getName(): string', '+ getAge(): number'] },
        { key: 2, name: 'Student', attributes: ['- studentId: string'], methods: ['+ getStudentId(): string'] }
      ],
      linkDataArray: [
        { from: 1, to: 2 }
      ]
    });
  }

  addClass(): void {
    const newKey = this.diagram.model.nodeDataArray.length + 1;
    const newNode = { key: newKey, name: 'NewClass', attributes: ['- attribute: type'], methods: ['+ method(): void'] };

    const model = this.diagram.model as go.GraphLinksModel;
    model.addNodeData(newNode);
  }

  addRelation(): void {
    if (this.diagram.selection.count === 2) {
      const [fromNode, toNode] = Array.from(this.diagram.selection) as go.Node[];
      const model = this.diagram.model as go.GraphLinksModel;
      model.addLinkData({ from: fromNode.data.key, to: toNode.data.key });
    } else {
      alert('Selecciona exactamente dos clases para crear una relación.');
    }
  }

  exportModel(): void {
    const json = this.diagram.model.toJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'class-diagram.json';
    link.click();

    URL.revokeObjectURL(url);
  }

  importModel(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const json = reader.result as string;
        this.diagram.model = go.Model.fromJson(json);
      };
      reader.readAsText(input.files[0]);
    }
  }
}
