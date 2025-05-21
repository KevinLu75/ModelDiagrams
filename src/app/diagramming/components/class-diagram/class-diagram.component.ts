import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';
import { Router } from '@angular/router';
import { ClassDialogComponent, ClassData } from '../class-dialog/class-dialog.component';
import { RelationDialogComponent, RelationData } from '../relation-dialog/relation-dialog.component';

@Component({
  selector: 'app-class-diagram',
  standalone: true,
  imports: [CommonModule, ClassDialogComponent, RelationDialogComponent],
  templateUrl: './class-diagram.component.html',
  styles: []
})
export class ClassDiagramComponent implements OnInit {
  @ViewChild('diagramDiv', { static: true }) diagramRef!: ElementRef;
  private diagram!: go.Diagram;
  
  // Dialog states
  showClassDialog = false;
  isEditingClass = false;
  currentClassData: ClassData = { name: '', attributes: [], methods: [] };
  
  showRelationDialog = false;
  selectedNodes: { fromKey: number | null, toKey: number | null } = { fromKey: null, toKey: null };

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
      'clickCreatingTool.archetypeNodeData': { name: 'Nueva Clase', attributes: ['- attribute: type'], methods: ['+ method(): returnType'] },
      layout: $(go.TreeLayout, { angle: 0, layerSpacing: 35 }),
      "animationManager.isEnabled": false,
      "toolManager.hoverDelay": 100,
      
      // Handle double-click on nodes
      "clickSelectingTool.standardMouseSelect": function() {
        // Fix: use explicit type casting and reference
        const tool = this as any;
        const diagram = tool.diagram;
        
        if (diagram.lastInput.clickCount === 2) {
          const part = diagram.findPartAt(diagram.lastInput.documentPoint, false);
          if (part instanceof go.Node) {
            // Notify the component
            const component = (diagram as any).component;
            if (component) component.handleNodeDoubleClick(part);
          }
        }
        go.ClickSelectingTool.prototype.standardMouseSelect.call(this);
      }
    });
    
    // Store reference to component for callback
    (this.diagram as any).component = this;


    // Class node template
    this.diagram.nodeTemplate = $(
      go.Node, 'Auto',
      {
        resizable: true,
        resizeObjectName: 'SHAPE',
        layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized
      },
      $(go.Shape, 'Rectangle', {
        fill: '#2D3748', stroke: '#4B5563', strokeWidth: 2,
        portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
        name: 'SHAPE'
      }),
      $(
        go.Panel, 'Table', { margin: 8, maxSize: new go.Size(250, NaN) },
        // Class name
        $(go.RowColumnDefinition, { row: 0, separatorStroke: "white" }),
        $(go.TextBlock, {
          row: 0, font: 'bold 16px sans-serif', stroke: '#F7FAFC', margin: new go.Margin(0, 0, 6, 0), editable: true,
          alignment: go.Spot.Center
        }, new go.Binding('text', 'name').makeTwoWay()),

        // Separator line
        $(go.Shape, "LineH", { 
          height: 1, stroke: "#CBD5E0",
          strokeWidth: 1.5,
          row: 1, column: 0, 
          width: 999, 
          stretch: go.GraphObject.Horizontal
        }),

        // Attributes section
        $(go.TextBlock, "Atributos", {
          row: 2,
          font: "italic 12px sans-serif",
          stroke: "#A0AEC0",
          margin: new go.Margin(5, 0, 0, 0)
        }),
        $(go.Panel, 'Vertical', { row: 3, margin: new go.Margin(5, 0, 0, 0), stretch: go.GraphObject.Horizontal, defaultAlignment: go.Spot.Left },
          new go.Binding('itemArray', 'attributes'),
          {
            itemTemplate: $(go.Panel, 'Auto', { stretch: go.GraphObject.Horizontal, margin: new go.Margin(0, 0, 3, 0) },
              $(go.TextBlock, {
                margin: new go.Margin(0, 5, 0, 0),
                stroke: '#E2E8F0',
                font: '13px sans-serif',
                alignment: go.Spot.Left,
                editable: true
              }, new go.Binding('text').makeTwoWay())
            )
          }
        ),

        // Separator line
        $(go.Shape, "LineH", { 
          height: 1, stroke: "#CBD5E0",
          strokeWidth: 1.5,
          row: 4, column: 0, 
          width: 999, 
          stretch: go.GraphObject.Horizontal
        }),

        // Methods section
        $(go.TextBlock, "Métodos", {
          row: 5,
          font: "italic 12px sans-serif",
          stroke: "#A0AEC0", 
          margin: new go.Margin(5, 0, 0, 0)
        }),
        $(go.Panel, 'Vertical', { row: 6, margin: new go.Margin(5, 0, 0, 0), stretch: go.GraphObject.Horizontal, defaultAlignment: go.Spot.Left },
          new go.Binding('itemArray', 'methods'),
          {
            itemTemplate: $(go.Panel, 'Auto', { stretch: go.GraphObject.Horizontal, margin: new go.Margin(0, 0, 3, 0) },
              $(go.TextBlock, {
                margin: new go.Margin(0, 0, 3, 0),
                stroke: '#E2E8F0',
                font: '13px sans-serif',
                alignment: go.Spot.Left,
                editable: true
              }, new go.Binding('text').makeTwoWay())
            )
          }
        )
      )
    );

    // Define link templates for different relationship types
    const arrowheadMap = {
      'inheritance': { toArrow: "Triangle", fill: "white", stroke: "#4B5563" },
      'association': { toArrow: "Standard", fill: "#4B5563" },
      'aggregation': { toArrow: "Diamond", fill: "white", stroke: "#4B5563" },
      'composition': { toArrow: "Diamond", fill: "#4B5563" },
      'dependency': { toArrow: "OpenTriangle", stroke: "#4B5563" }
    };

    this.diagram.linkTemplateMap = new go.Map<string, go.Link>();
    
    // Default template
    this.diagram.linkTemplate = $(
      go.Link,
      { 
        routing: go.Link.AvoidsNodes, corner: 10, 
        relinkableFrom: true, relinkableTo: true,
        reshapable: true, resegmentable: true
      },
      $(go.Shape, { strokeWidth: 2, stroke: '#4B5563' }),
      $(go.Shape, { toArrow: "Standard", fill: "#4B5563" }),
      $(go.TextBlock, {
        segmentIndex: 0,
        segmentOffset: new go.Point(0, -15),
        font: "12px sans-serif",
        stroke: "#E2E8F0",
        background: "#2D3748",
        editable: true
      }, new go.Binding("text", "label").makeTwoWay())
    );

    // Add templates for each relationship type
    Object.entries(arrowheadMap).forEach(([type, arrowConfig]) => {
      this.diagram.linkTemplateMap.add(type, $(
        go.Link,
        { 
          routing: go.Link.AvoidsNodes, corner: 10,
          relinkableFrom: true, relinkableTo: true,
          reshapable: true, resegmentable: true
        },
        $(go.Shape, { strokeWidth: 2, stroke: '#4B5563', strokeDashArray: type === 'dependency' ? [6, 3] : null }),
        $(go.Shape, arrowConfig),
        $(go.TextBlock, {
          segmentIndex: 0,
          segmentOffset: new go.Point(0, -15),
          font: "12px sans-serif",
          stroke: "#E2E8F0",
          background: "#2D3748",
          editable: true
        }, new go.Binding("text", "label").makeTwoWay())
      ));
    });

    // Initialize with example data
    this.diagram.model = $(go.GraphLinksModel, {
      nodeDataArray: [
        { key: 1, name: 'Person', attributes: ['- name: string', '- age: number'], methods: ['+ getName(): string', '+ getAge(): number'] },
        { key: 2, name: 'Student', attributes: ['- studentId: string'], methods: ['+ getStudentId(): string'] }
      ],
      linkDataArray: [
        { from: 1, to: 2, category: 'inheritance' }
      ],
      linkCategoryProperty: "category"
    });
  }

  // Handle double-click on node for editing
  handleNodeDoubleClick(node: go.Node): void {
    const data = node.data;
    this.currentClassData = {
      name: data.name,
      attributes: [...data.attributes],
      methods: [...data.methods]
    };
    this.isEditingClass = true;
    this.showClassDialog = true;
  }

  addClass(): void {
    this.isEditingClass = false;
    this.currentClassData = { name: 'Nueva Clase', attributes: [], methods: [] };
    this.showClassDialog = true;
  }

  saveClass(classData: ClassData): void {
    const model = this.diagram.model as go.GraphLinksModel;
    
    if (this.isEditingClass) {
      // Find the selected node and update its data
      const selectedNode = this.diagram.selection.first() as go.Node;
      if (selectedNode) {
        model.startTransaction('edit class');
        model.setDataProperty(selectedNode.data, 'name', classData.name);
        model.setDataProperty(selectedNode.data, 'attributes', [...classData.attributes]);
        model.setDataProperty(selectedNode.data, 'methods', [...classData.methods]);
        model.commitTransaction('edit class');
      }
    } else {
      // Add new node
      const newKey = Date.now(); // Use timestamp as unique key
      const newNode = { 
        key: newKey, 
        name: classData.name, 
        attributes: [...classData.attributes], 
        methods: [...classData.methods] 
      };
      
      model.startTransaction('add class');
      model.addNodeData(newNode);
      model.commitTransaction('add class');
    }
    
    this.showClassDialog = false;
  }

  cancelClassDialog(): void {
    this.showClassDialog = false;
  }

  addRelation(): void {
    const selection = this.diagram.selection.toArray();
    
    if (selection.length === 2 && selection[0] instanceof go.Node && selection[1] instanceof go.Node) {
      const fromNode = selection[0] as go.Node;
      const toNode = selection[1] as go.Node;
      
      this.selectedNodes = {
        fromKey: fromNode.data.key,
        toKey: toNode.data.key
      };
      
      this.showRelationDialog = true;
    } else {
      alert('Selecciona exactamente dos clases para crear una relación (presiona Ctrl para selección múltiple).');
    }
  }

  saveRelation(relation: RelationData): void {
    const model = this.diagram.model as go.GraphLinksModel;
    
    model.startTransaction('add relation');
    model.addLinkData({
      from: relation.fromKey,
      to: relation.toKey,
      category: relation.type,
      label: relation.label
    });
    model.commitTransaction('add relation');
    
    this.showRelationDialog = false;
    this.selectedNodes = { fromKey: null, toKey: null };
  }

  cancelRelationDialog(): void {
    this.showRelationDialog = false;
    this.selectedNodes = { fromKey: null, toKey: null };
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
        try {
          this.diagram.model = go.Model.fromJson(json);
        } catch (e) {
          alert('Error al importar el diagrama. Formato no válido.');
          console.error(e);
        }
      };
      reader.readAsText(input.files[0]);
    }
  }
}