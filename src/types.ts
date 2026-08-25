export type LegalEngineeringArea =
  | 'laboral'
  | 'mercantil'
  | 'fiscal'
  | 'aduanal'
  | 'comercio_exterior';

export type CorpusSearchScope = 'todos' | LegalEngineeringArea;
export type CorpusSourceKind = 'ley' | 'reglamento';

export interface LegalArticle {
  id: string;
  lawCode: string;
  lawName: string;
  articleNumber: string;
  title: string;
  content: string;
  area: LegalEngineeringArea;
  sourceKind: CorpusSourceKind;
  sourceName: string;
  sourceUrl: string;
  score?: number;
}

export type AppModuleTab = 'normativa' | 'licitaciones' | 'desktop';

export type LicitacionMateria =
  | 'adquisiciones'
  | 'servicios'
  | 'obra_publica'
  | 'arrendamientos'
  | 'servicios_obra';

export type LicitacionCaracter =
  | 'nacional'
  | 'internacional_tlc'
  | 'internacional_abierta'
  | 'no_especificado';

export type LicitacionAmbito = 'federal' | 'estatal' | 'municipal';
export type LicitacionDataCompleteness = 'complete' | 'publication_only';

export interface LicitacionOfficialSource {
  id: string;
  nombre: string;
  url: string;
  ambito: LicitacionAmbito;
  verificadaEl: string;
  integridad: LicitacionDataCompleteness;
}

export type LicitacionTipoProcedimiento =
  | 'licitacion_publica'
  | 'invitacion_tres_personas'
  | 'adjudicacion_directa';

export type LicitacionEstatus =
  | 'convocatoria_publicada'
  | 'visita_sitio'
  | 'junta_aclaraciones'
  | 'recepcion_propuestas'
  | 'evaluacion'
  | 'fallo_emitido';

export interface LicitacionPublica {
  id: string;
  numeroProcedimiento: string;
  expediente: string;
  titulo: string;
  descripcion: string;
  convocante: string;
  siglasConvocante: string;
  unidadCompradora: string;
  materia: LicitacionMateria;
  caracter: LicitacionCaracter;
  tipoProcedimiento: LicitacionTipoProcedimiento;
  estatus: LicitacionEstatus;
  entidadFederativa: string;
  fechaPublicacion: string;
  fechaVisitaSitio?: string;
  fechaJuntaAclaraciones?: string;
  fechaLimitePropuestas?: string;
  fechaFallo?: string;
  montoEstimado?: number;
  moneda: 'MXN' | 'USD';
  marcoLegal: string;
  enlaceCompraNet: string;
  fuenteOficial?: LicitacionOfficialSource;
  requisitosClave: string[];
  anexosDisponibles: string[];
  score?: number;
}

export interface LicitacionSearchFilter {
  query?: string;
  materia?: 'todas' | LicitacionMateria;
  caracter?: 'todos' | LicitacionCaracter;
  convocante?: string;
  entidadFederativa?: string;
  estatus?: 'todos' | LicitacionEstatus;
  sortBy?: 'cierre_proximo' | 'reciente' | 'monto_mayor' | 'relevancia';
}

export interface LicitacionSearchResult {
  query: string;
  licitaciones: LicitacionPublica[];
  total: number;
  executionTimeMs: number;
}
