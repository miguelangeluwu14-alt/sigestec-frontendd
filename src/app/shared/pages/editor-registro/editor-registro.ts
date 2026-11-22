import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { DocumentoAdjunto } from '../../components/documento-adjunto/documento-adjunto';

type Campo = { key: string; label: string; largo?: boolean; numero?: boolean; bloqueado?: boolean };
type Configuracion = { titulo: string; ruta: string; campos: Campo[]; pdf?: boolean; pdfObligatorio?: boolean; nota?: string };

const CONFIGURACIONES: Record<string, Configuracion> = {
  solicitudes: { titulo: 'Solicitud de servicio', ruta: '/solicitudes', pdf: true, campos: [
    {key:'cliente.razonSocial',label:'Cliente',bloqueado:true},
    {key:'tipoServicio.nombre',label:'Tipo de servicio',bloqueado:true},
    {key:'fechaRecepcion',label:'Fecha de recepción',bloqueado:true},
    {key:'descripcion',label:'Descripción del trabajo',largo:true},
    {key:'observaciones',label:'Observaciones',largo:true},
    {key:'lugarServicio',label:'Lugar del servicio'},
  ], nota:'Solo editable si la solicitud está pendiente y todavía no tiene cotización.' },
  compras: { titulo:'Orden de compra',ruta:'/ordenes-compra',pdf:true,pdfObligatorio:true,campos:[
    {key:'cotizacion.numero',label:'Cotización',bloqueado:true},
    {key:'numero',label:'Número de orden'},
    {key:'fechaEmision',label:'Fecha de emisión',bloqueado:true},
    {key:'montoTotal',label:'Monto total',bloqueado:true},
  ],nota:'Solo se corrige el número antes de asociar una orden de trabajo. El PDF se puede reemplazar, no quitar sin reemplazo.' },
  ats: { titulo:'ATS',ruta:'/ats',pdf:true,campos:[
    {key:'ordenTrabajo.numero',label:'Orden de trabajo',bloqueado:true},
    {key:'condicionesArea',label:'Condiciones del área',largo:true},
    {key:'observaciones',label:'Observaciones',largo:true},
    {key:'peligros',label:'Peligros identificados',bloqueado:true},
    {key:'epp',label:'Equipos de protección',bloqueado:true},
    {key:'herramientas',label:'Herramientas',bloqueado:true},
  ], nota:'No se pueden modificar la OT, los peligros, el EPP ni las etapas desde una corrección; después de aprobación el ATS queda protegido.' },
  ejecuciones: {titulo:'Ejecución de servicio',ruta:'/ejecuciones',campos:[
    {key:'ordenTrabajo.numero',label:'Orden de trabajo',bloqueado:true},
    {key:'fechaEjecucion',label:'Fecha de ejecución',bloqueado:true},
    {key:'descripcion',label:'Descripción del trabajo',largo:true},
    {key:'mediciones',label:'Mediciones',largo:true},
    {key:'observaciones',label:'Observaciones',largo:true},
  ],nota:'Los consumos y evidencias son parte del historial. Solo se corrigen textos antes de emitir el informe.' },
  informes: {titulo:'Informe técnico',ruta:'/informes',pdf:true,campos:[
    {key:'ordenTrabajo.numero',label:'Orden de trabajo',bloqueado:true},
    {key:'numeroInforme',label:'Número de informe',bloqueado:true},
    {key:'fechaEnvio',label:'Fecha de envío',bloqueado:true},
    {key:'diagnostico',label:'Diagnóstico',largo:true},
    {key:'trabajosRealizados',label:'Trabajos realizados',largo:true},
    {key:'conclusiones',label:'Conclusiones',largo:true},
    {key:'recomendaciones',label:'Recomendaciones',largo:true},
  ],nota:'Los datos técnicos se pueden corregir mientras no exista conformidad del servicio.' },
  clientes: {titulo:'Cliente',ruta:'/clientes',campos:[
    {key:'ruc',label:'RUC',bloqueado:true},{key:'razonSocial',label:'Razón social'},
    {key:'telefono',label:'Teléfono'},{key:'correo',label:'Correo'},
  ]},
  'tipos-servicio': {titulo:'Tipo de servicio',ruta:'/tipos-servicio',campos:[
    {key:'nombre',label:'Nombre'},{key:'descripcion',label:'Descripción',largo:true},
  ]},
  personal: {titulo:'Personal',ruta:'/personal',campos:[
    {key:'nombre',label:'Nombres y apellidos'}, {key:'perfil',label:'Perfil',bloqueado:true},
  ]},
  materiales: {titulo:'Material',ruta:'/almacen/materiales',campos:[
    {key:'codigo',label:'Código',bloqueado:true},{key:'nombre',label:'Nombre'},
    {key:'unidadMedida',label:'Unidad de medida'},{key:'stockMinimo',label:'Stock mínimo',numero:true},
    {key:'stockActual',label:'Stock actual',bloqueado:true},
  ]},
  herramientas: {titulo:'Herramienta',ruta:'/almacen/herramientas',campos:[
    {key:'codigo',label:'Código',bloqueado:true},{key:'nombre',label:'Nombre'},
    {key:'descripcion',label:'Descripción',largo:true},
    {key:'cantidadTotal',label:'Cantidad total',bloqueado:true},
    {key:'cantidadDisponible',label:'Disponible',bloqueado:true},
  ]},
};

@Component({
  standalone:true,
  imports:[FormsModule,RouterLink,DocumentoAdjunto],
  templateUrl:'./editor-registro.html',
  styleUrl:'./editor-registro.css',
})
export class EditorRegistro implements OnInit {
  private api=inject(ApiService);
  private route=inject(ActivatedRoute);
  private router=inject(Router);
  private cdr=inject(ChangeDetectorRef);

  recurso=this.route.snapshot.paramMap.get('recurso') || '';
  id=Number(this.route.snapshot.paramMap.get('id') || 0);
  config=CONFIGURACIONES[this.recurso];
  registro:any=null;
  datos:Record<string,any>={};
  archivo:File|null=null;
  quitarAnterior=false;
  cargando=true;
  guardando=false;
  error='';

  get campos():Campo[]{return this.config?.campos || []}
  get urlAnterior():string|null { return this.registro?.urlArchivo || null; }
  get evidencia():any[]{return Array.isArray(this.registro?.evidencias)?this.registro.evidencias:[];}
  get permitidos():Campo[]{return this.campos.filter(c=>!c.bloqueado);}
  get puedeQuitar():boolean{return !!this.config?.pdf && !this.config.pdfObligatorio;}
  get estado():string{return this.registro?.estado || (this.registro?.activo === false ? 'INACTIVO':'');}
  get bloqueadoEstado():boolean {
    if (!this.registro) return true;
    switch(this.recurso){
      case 'solicitudes': return this.estado!=='PENDIENTE';
      case 'compras': return this.estado!=='REGISTRADA' && !!this.estado;
      case 'ats': return !['PENDIENTE','ELABORADO'].includes(this.estado);
      case 'clientes': case 'tipos-servicio': case 'materiales': case 'herramientas': return this.estado==='I';
      case 'personal': return this.registro.activo===false;
      default: return false;
    }
  }
  valor(c:Campo):any {
    return c.key.split('.').reduce((o,key)=>o?.[key],this.registro) ?? '—';
  }
  ngOnInit(){
    if(!this.config || !(this.id>0)){this.error='Registro no reconocido';this.cargando=false;return;}
    this.api.get<any[]>(this.config.ruta).subscribe({
      next:(lista)=>{
        this.registro=lista.find(x=>x.id===this.id);
        if(!this.registro) this.error='No se encontró el registro';
        else this.datos=Object.fromEntries(this.permitidos.map(c=>[c.key,this.registro[c.key]??'']));
        this.cargando=false;this.cdr.markForCheck();
      },
      error:(e)=>{this.cargando=false;this.error=this.api.mensaje(e);this.cdr.markForCheck();},
    });
  }
  elegir(e:Event){
    const archivo=(e.target as HTMLInputElement).files?.item(0)||null;
    if(archivo && (archivo.size>8*1024*1024 || (!archivo.name.toLowerCase().endsWith('.pdf') && archivo.type!=='application/pdf'))){
      this.error='Adjunta un PDF válido de hasta 8 MB.';return;
    }
    this.archivo=archivo;
    if(archivo)this.quitarAnterior=false;
    this.error='';
  }
  quitarArchivo(){this.archivo=null;}
  quitarExistente(){this.quitarAnterior=true;this.archivo=null;}
  recuperarExistente(){this.quitarAnterior=false;}
  guardar(){
    if(this.guardando||!this.registro||this.bloqueadoEstado)return;
    this.error='';this.guardando=true;
    const datos={...this.datos};
    if(this.recurso==='materiales' && 'stockMinimo' in datos)datos['stockMinimo']=Number(datos['stockMinimo']);
    const ruta=`/gestion/${this.recurso}/${this.id}`;
    const conDocumento=!!this.config.pdf && (!!this.archivo || this.quitarAnterior);
    const req=conDocumento?(()=>{
      const fd=new FormData();
      fd.append('datos',new Blob([JSON.stringify(datos)],{type:'application/json'}));
      if(this.archivo)fd.append('pdf',this.archivo);
      fd.append('quitar',String(this.quitarAnterior));
      return this.api.put(ruta+'/documento',fd);
    })():this.api.put(ruta,datos);
    req.subscribe({
      next:()=>{this.guardando=false;this.router.navigateByUrl(this.config.ruta);},
      error:(e)=>{this.guardando=false;this.error=this.api.mensaje(e);this.cdr.markForCheck();},
    });
  }
}
