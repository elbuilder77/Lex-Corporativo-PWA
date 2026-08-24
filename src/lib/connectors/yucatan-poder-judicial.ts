import type { LicitacionPublica } from '../../types';

export const YUCATAN_PODER_JUDICIAL_SOURCE = {
  id: 'yucatan-poder-judicial',
  nombre: 'Poder Judicial de Yucatán · Actas y licitaciones',
  url: 'https://www.pjyucatan.gob.mx/transparencia/informacion_publica/tsj/licitaciones',
  ambito: 'estatal',
  verificadaEl: '2026-08-24',
  integridad: 'publication_only',
} as const;

/**
 * Primera instantánea verificable del conector estatal de Yucatán.
 *
 * La fuente oficial publica el número, objeto, convocante y fecha de publicación,
 * pero no expone de forma indexable el cronograma ni el monto. Esos campos se
 * conservan vacíos para no presentar inferencias como datos oficiales.
 */
export const YUCATAN_PODER_JUDICIAL_LICITACIONES: LicitacionPublica[] = [
  {
    id: 'yuc-pj-tsj-2026-07',
    numeroProcedimiento: 'PODJUDTSJ-CA 07/2026',
    expediente: 'PODJUDTSJ-CA 07/2026',
    titulo: 'Aseguramiento del parque vehicular, del edificio y de grupo del personal del Tribunal Superior de Justicia',
    descripcion:
      'Publicación detectada en el portal oficial de transparencia del Poder Judicial del Estado de Yucatán. La vigencia, el calendario, las partidas y los requisitos deben confirmarse en las bases oficiales.',
    convocante: 'Tribunal Superior de Justicia del Estado de Yucatán',
    siglasConvocante: 'TSJ Yucatán',
    unidadCompradora: 'Comité de Adquisiciones, Arrendamientos, Servicios y Obra Pública',
    materia: 'servicios',
    caracter: 'no_especificado',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'convocatoria_publicada',
    entidadFederativa: 'Yucatán',
    fechaPublicacion: '2026-08-03',
    moneda: 'MXN',
    marcoLegal: 'Normativa y condiciones aplicables por confirmar en las bases oficiales del procedimiento.',
    enlaceCompraNet: YUCATAN_PODER_JUDICIAL_SOURCE.url,
    fuenteOficial: YUCATAN_PODER_JUDICIAL_SOURCE,
    requisitosClave: [],
    anexosDisponibles: [],
  },
];
