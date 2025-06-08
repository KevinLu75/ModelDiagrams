import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as go from 'gojs';
import jsPDF from 'jspdf';
import { VersionesService } from '../../services/versiones/versiones.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { NuevaVersionComponent } from '../nueva-version/nueva-version.component';


@Component({
  selector: 'app-diagram-package',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uml-paquetes.component.html',
  styleUrl: './uml-paquetes.component.css'
})
export class UmlPaquetesComponent implements AfterViewInit, OnInit {
  @ViewChild('myDiagramDiv', { static: false }) diagramDiv!: ElementRef;
  @ViewChild('myPaletteDiv', { static: false }) paletteDiv!: ElementRef;
  @ViewChild('levelSlider', { static: false }) levelSlider!: ElementRef;
  
  myDiagram!: go.Diagram;
  myPalette!: go.Palette;
  public relationshipMode: boolean = false;
  tipoRelacion: string = "";
  packageCounter: number = 0;
  versiones: any = {};

  constructor(
    private VerSvc: VersionesService, 
    private toastr: ToastrService, 
    private verSvc: VersionesService, 
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getVersiones();
  }

  ngAfterViewInit(): void {
    this.initDiagram();
  }

  initDiagram(): void {
    const $ = go.GraphObject.make;

    this.myDiagram = $(go.Diagram, this.diagramDiv.nativeElement, {
      'grid.visible': true,
      'undoManager.isEnabled': true,
      'InitialLayoutCompleted': () => this.updateTotalGroupDepth(),
      mouseDrop: (e: go.InputEvent) => this.finishDrop(e, null),
      layout: $(go.GridLayout, { wrappingWidth: Infinity })
    });

    this.myDiagram.layout = $(go.GridLayout, {
      wrappingColumn: 3,
      cellSize: new go.Size(100, 100),
      spacing: new go.Size(10, 10)
    });
    
    /** PALETA **/
    this.myPalette = $(go.Palette, this.paletteDiv.nativeElement, {
      nodeTemplateMap: this.myDiagram.nodeTemplateMap,
      groupTemplateMap: this.myDiagram.groupTemplateMap,
      layout: $(go.GridLayout, {
        wrappingColumn: 2,
        cellSize: new go.Size(100, 100),
        spacing: new go.Size(10, 10),
        alignment: go.GridAlignment.Position
      })
    });

    this.myPalette.layout = $(go.GridLayout, {
      wrappingColumn: 2,
      cellSize: new go.Size(100, 50),
      spacing: new go.Size(10, 10),
      alignment: go.GridAlignment.Position
    });

    this.myPalette.nodeTemplateMap.add('ArrowNode',
      $(go.Node, 'Horizontal',
        { background: 'transparent', movable: false },
        $(go.Shape, {
          geometryString: 'M0 0 L30 15 L0 30 Z',
          fill: 'black', stroke: null, width: 30, height: 30
        }),
        $(go.TextBlock, 'Flecha', { margin: 5, font: 'bold 12px sans-serif' })
      )
    );

    /** TEMPLATE PARA NODOS **/
    this.myDiagram.nodeTemplate = $(go.Node, 'Auto',
      {
        mouseDrop: (e: go.InputEvent, node: go.GraphObject) => this.finishDrop(e, (node as go.Node).containingGroup),
        fromLinkable: true,
        toLinkable: true
      },
      $(go.Shape, 'RoundedRectangle', 
        { stroke: null, strokeWidth: 0 }
      ).bind('fill', 'color'),
      $(go.TextBlock, { margin: 8, editable: true, font: '13px Lora, serif' })
        .bind('text')
    );

    this.myDiagram.linkTemplate =
      $(go.Link,
        {
          routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpOver,
          corner: 5,
          relinkableFrom: true,
          relinkableTo: true,
          selectable: true
        },
        $(go.Shape, { stroke: 'gray', strokeWidth: 2 }),
        $(go.Shape, { toArrow: 'Standard', stroke: null, fill: 'gray' })
      );

    this.myDiagram.linkTemplateMap.add('dashed',
      $(go.Link, {
          routing: go.Link.AvoidsNodes, 
          corner: 5, 
          relinkableFrom: true, 
          relinkableTo: true, 
          reshapable: true, 
          adjusting: go.Link.Stretch
        },
        $(go.Shape, { stroke: 'gray', strokeDashArray: [4,2] })
      )
    );

    this.myDiagram.linkTemplateMap.add('access',
      $(go.Link, { 
          routing: go.Link.AvoidsNodes, 
          corner: 5, 
          relinkableFrom: true, 
          relinkableTo: true, 
          reshapable: true, 
          adjusting: go.Link.Stretch
        },
        $(go.Shape, { stroke: 'green', strokeDashArray: [4,2] }),
        $(go.Shape, { toArrow: 'OpenTriangle', stroke: 'green' }),
        $(go.TextBlock, '<<access>>', {
          segmentFraction: 0.5, 
          segmentOffset: new go.Point(-20, -10), 
          font: "bold 20px sans-serif", 
          stroke: "green", 
          editable: true
        })
      )
    );
  
    this.myDiagram.linkTemplateMap.add('import',
      $(go.Link, { 
          routing: go.Link.AvoidsNodes, 
          corner: 5, 
          relinkableFrom: true, 
          relinkableTo: true, 
          reshapable: true, 
          adjusting: go.Link.Stretch
        },
        $(go.Shape, { stroke: 'green', strokeDashArray: [4,2] }),
        $(go.Shape, { toArrow: 'OpenTriangle', stroke: 'green' }),
        $(go.TextBlock, '<<import>>', {
          segmentFraction: 0.5, 
          segmentOffset: new go.Point(-20, -10), 
          font: "bold 20px sans-serif", 
          stroke: "green", 
          editable: true
        })
      )
    );

    this.myDiagram.addDiagramListener('ExternalObjectsDropped', (e) => {
      e.subject.each((part: go.Part) => {
        if (part.category === 'ArrowNode') {
          const model = this.myDiagram.model as go.GraphLinksModel;
          model.removeNodeData(part.data);
          model.addLinkData({ from: '', to: '' });
        } else if (part instanceof go.Group) { 
          const model = this.myDiagram.model as go.GraphLinksModel;
          model.setDataProperty(part.data, "text", "Paquete " + this.packageCounter++);
        }
      });
    }); 
    
    /** TEMPLATE PARA GRUPOS **/
    this.myDiagram.groupTemplate = $(go.Group, 'Auto',
      {
        background: 'skyblue',
        ungroupable: true,
        layout: $(go.GridLayout, { 
          wrappingColumn: Infinity, 
          cellSize: new go.Size(1, 1), 
          spacing: new go.Size(5, 5) 
        }),
        mouseDragEnter: (e: go.InputEvent, grp: go.GraphObject, prev: go.GraphObject) => this.highlightGroup(e, grp as go.Group, true),
        mouseDragLeave: (e: go.InputEvent, grp: go.GraphObject, next: go.GraphObject) => this.highlightGroup(e, grp as go.Group, false),
        mouseDrop: (e: go.InputEvent, grp: go.GraphObject) => this.finishDrop(e, grp as go.Group),
        isSubGraphExpanded: true
      },
      $(go.Panel, "Auto",
        $(go.Shape, {
          figure: "RoundedRectangle",
          fill: "#F5F5DC",
          stroke: "#D4AF37",
          strokeWidth: 2,
          spot1: go.Spot.TopLeft,
          spot2: go.Spot.BottomRight
        }),
        $(go.Panel, "Vertical",
          $(go.Panel, "Horizontal", { stretch: go.Stretch.Horizontal },
            $(go.TextBlock, {
              editable: true,
              font: "bold 14px Lora, serif",
              stroke: "#5C4033",
              margin: new go.Margin(5, 0, 5, 10)
            }).bind("text"),
            $("SubGraphExpanderButton", { alignment: go.Spot.Right })
          ),
          $(go.Placeholder, { padding: 10 })
        )
      )
    );

    /** CONFIGURAR MODELO DE LA PALETA **/
    this.myPalette.model = new go.GraphLinksModel([
      { text: 'Nodo', color: '#ACE600', clave: 'nodo' },  
      { text: 'Clase', color: '#FF0000', clave: 'clase' },
      { text: 'Componente', color: '#0000FF', key: 'component' },                                                 
      { isGroup: true, text: 'Paquete ' + this.packageCounter++, horiz: 'true', color: '#FFDD33', clave: 'paquete' },    
    ]);

    /** EVENTOS PARA SLIDER **/
    this.levelSlider.nativeElement.addEventListener('change', () => this.reexpand());
    this.levelSlider.nativeElement.addEventListener('input', () => this.reexpand());

    this.load();
    console.log("Diagrama de paquetes inicializado");
  }

  /** RESALTAR GRUPOS AL ARRASTRAR **/
  highlightGroup(e: go.InputEvent, grp: go.Group, show: boolean): void {
    if (!grp) return;
    e.handled = true;
    grp.isHighlighted = show;
  }

  /** AGRUPAR ELEMENTOS AL SOLTAR **/
  finishDrop(e: go.InputEvent, grp: go.Group | null): void {
    const ok = grp ? grp.addMembers(grp.diagram!.selection, true) : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true);
    if (!ok) e.diagram.currentTool.doCancel();
    this.updateTotalGroupDepth();
  }

  /** EXPANDIR GRUPOS SEGÚN SLIDER **/
  reexpand(): void {
    const level = parseInt(this.levelSlider.nativeElement.value);
    this.myDiagram.commit(diag => {
      diag.findTopLevelGroups().each(g => this.expandGroups(g, 0, level));
    }, 'reexpand');
  }

  expandGroups(g: go.Part, i: number, level: number): void {
    if (!(g instanceof go.Group)) return;
    g.isSubGraphExpanded = i < level;
    g.memberParts.each(m => this.expandGroups(m, i + 1, level));
  }

  /** ACTUALIZAR PROFUNDIDAD DE LOS GRUPOS **/
  updateTotalGroupDepth(): void {
    let d = 0;
    this.myDiagram.findTopLevelGroups().each(g => d = Math.max(d, this.groupDepth(g)));
    this.levelSlider.nativeElement.max = Math.max(0, d);
  }

  groupDepth(g: go.Part): number {
    if (!(g instanceof go.Group)) return 0;
    let d = 1;
    g.memberParts.each(m => d = Math.max(d, this.groupDepth(m) + 1));
    return d;
  }

  /** GUARDAR Y CARGAR MODELO **/
  save(): void {
    (document.getElementById('mySavedModel') as HTMLTextAreaElement).value = this.myDiagram.model.toJson();
    this.myDiagram.isModified = false;

    const jsonData = this.myDiagram.model.toJson();
    const version = localStorage.getItem('version');
    this.VerSvc.updateVersion(version, jsonData).subscribe(
      (data) => {
        this.guardadoConExito();
      },
      (error) => {
        this.toastr.error(`Error al guardar ${error}`, 'Error');
      }
    );
  }

  load(): void {
    this.myDiagram.model = go.Model.fromJson((document.getElementById('mySavedModel') as HTMLTextAreaElement).value);
  }

  guardadoConExito() {
    this.toastr.success('Diagrama Guardado con Éxito', 'Nice!');
  }

  toggleRelationshipMode(): void {
    this.relationshipMode = !this.relationshipMode;
    this.myDiagram.toolManager.linkingTool.isEnabled = this.relationshipMode;
  }

  setLinkType(type: string) {
    this.tipoRelacion = type;
    this.myDiagram.toolManager.linkingTool.isEnabled = true;
  
    let linkData: any = { category: type };
    
    if (type === "dashed") {
      linkData = { category: "dashed" };
    }
  
    this.myDiagram.toolManager.linkingTool.archetypeLinkData = linkData;
    console.log(`Modo de relación activado: ${type}`);
  }
  
  deleteSelection() {
    const selected = this.myDiagram.selection;
    
    if (selected.count > 0) {
      this.myDiagram.startTransaction("delete");
      selected.each(part => this.myDiagram.remove(part));
      this.myDiagram.commitTransaction("delete");
      console.log("Elemento eliminado");
    } else {
      this.toastr.warning("No hay nada seleccionado para eliminar", "Atención");
    }
  }

  // Nuevo método para generar PDF
  guardarComoImagen() {
    const imageData = this.myDiagram.makeImageData({
      scale: 1,
      background: "white",
      returnType: "image/png"
    });

    if (typeof imageData !== "string") {
      console.error("Error: No se pudo generar la imagen del diagrama");
      return;
    }
    
    const pdf = new jsPDF("landscape", "mm", "a4");
    pdf.addImage(imageData, "PNG", 10, 10, 280, 150);
    pdf.save("diagrama-paquetes.pdf");
  }

  getVersiones() {
    let proyecto = localStorage.getItem("proyectoId");
    this.verSvc.getVersiones(proyecto, 3).subscribe(
      (data) => {
        this.versiones = data;
        console.log(this.versiones);

        if (this.versiones.length > 0) {
          const firstVersionId = this.versiones[0].id_version;
          this.cargarVersion({ target: { value: firstVersionId } });
        }
      },
      (error) => {
        this.toastr.error('Error obteniendo versiones', 'Error');
      }
    );
  }

  cargarVersion(event: any): void {
    const version = event.target.value;
    console.log(version);
    this.verSvc.getVersion(version).subscribe(
      (data) => {
        this.myDiagram.model = go.Model.fromJson(data.json);
        localStorage.setItem("version", version);
      },
      (error) => {
        this.toastr.error('No hay un diagrama guardado', 'Error');
      }
    );
  }

  guardarNuevaVersion() {
    const dialogRef = this.dialog.open(NuevaVersionComponent, {
      width: '500px'
    });
    
    dialogRef.afterClosed().subscribe(versionName => {
      if (versionName) {
        const jsonDiagram = this.myDiagram.model.toJson();
        const id_proyecto = localStorage.getItem("proyectoId");

        this.verSvc.postVersiones(id_proyecto, 3, versionName.version, jsonDiagram).subscribe(
          (nueva) => {
            this.getVersiones();
            this.toastr.success('Nueva versión creada', 'Éxito');
          },
          (error) => {
            this.toastr.error('Error al crear la versión', 'Error');
          }
        );
      }
    });
  }
}