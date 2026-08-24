import type {
  LicitacionCaracter,
  LicitacionEstatus,
  LicitacionMateria,
  LicitacionPublica,
  LicitacionTipoProcedimiento,
} from '../types';

export const COMPRANET_PORTAL_URL = 'https://compranet.hacienda.gob.mx';
export const DATOS_ABIERTOS_URL = 'https://datos.gob.mx/busca/dataset/concentrado-de-contrataciones-abiertas-de-la-apf';
export const PDN_CONTRATACIONES_URL = 'https://www.plataformadigitalnacional.org/contrataciones';

export const MATERIA_LABELS: Record<'todas' | LicitacionMateria, string> = {
  todas: 'Todas las materias',
  adquisiciones: 'Adquisiciones de bienes',
  servicios: 'Prestación de servicios',
  obra_publica: 'Obra pública',
  arrendamientos: 'Arrendamientos',
  servicios_obra: 'Servicios relacionados con obra pública',
};

export const CARACTER_LABELS: Record<'todos' | LicitacionCaracter, string> = {
  todos: 'Todos los caracteres',
  nacional: 'Nacional',
  internacional_tlc: 'Internacional bajo TLC',
  internacional_abierta: 'Internacional abierta',
};

export const TIPO_PROCEDIMIENTO_LABELS: Record<LicitacionTipoProcedimiento, string> = {
  licitacion_publica: 'Licitación Pública',
  invitacion_tres_personas: 'Invitación a Cuando Menos 3 Personas',
  adjudicacion_directa: 'Adjudicación Directa',
};

export const ESTATUS_LABELS: Record<'todos' | LicitacionEstatus, string> = {
  todos: 'Todos los estatus',
  recepcion_propuestas: 'Recepción de propuestas',
  junta_aclaraciones: 'Junta de aclaraciones',
  convocatoria_publicada: 'Convocatoria publicada',
  visita_sitio: 'Visita al sitio',
  evaluacion: 'En evaluación',
  fallo_emitido: 'Fallo emitido',
};

export const LICITACIONES_DATA: LicitacionPublica[] = [
  {
    id: 'lic-imss-2026-001',
    numeroProcedimiento: 'LA-50-GYR-050GYR001-N-12-2026',
    expediente: 'EXP-IMSS-2026-04921',
    titulo: 'Adquisición consolidada de medicamentos oncológicos, inmunosupresores y material de curación especializado',
    descripcion: 'Adquisición consolidada bianual de claves de medicamentos de alta especialidad para la red hospitalaria de segundo y tercer nivel del Instituto Mexicano del Seguro Social a nivel nacional.',
    convocante: 'Instituto Mexicano del Seguro Social',
    siglasConvocante: 'IMSS',
    unidadCompradora: 'Coordinación de Control de Abasto · Nivel Central',
    materia: 'adquisiciones',
    caracter: 'nacional',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'recepcion_propuestas',
    entidadFederativa: 'Ciudad de México',
    fechaPublicacion: '2026-08-10',
    fechaJuntaAclaraciones: '2026-08-20',
    fechaLimitePropuestas: '2026-09-02T10:00:00',
    fechaFallo: '2026-09-18',
    montoEstimado: 845000000,
    moneda: 'MXN',
    marcoLegal: 'LAASSP Art. 26 Fracc. I, Art. 28 Fracc. I y Art. 39',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-IMSS-001',
    requisitosClave: [
      'Opinión de cumplimiento positiva SAT 32-D',
      'Registro Único de Proveedores y Contratistas (RUPC)',
      'Registro Sanitario COFEPRIS vigente',
      'Garantía de seriedad del 5% del monto total de propuesta',
      'Constancia de situación fiscal en materia de seguridad social IMSS e INFONAVIT',
    ],
    anexosDisponibles: ['Bases de Licitación', 'Anexo Técnico 1 (Catálogo de Claves)', 'Modelo de Contrato', 'Formato de Propuesta Económica'],
  },
  {
    id: 'lic-cfe-2026-002',
    numeroProcedimiento: 'CFE-0001-CAS-0045-2026',
    expediente: 'EXP-CFE-DIST-2026-1102',
    titulo: 'Mantenimiento integral y modernización de subestaciones eléctricas de distribución y transformadores de potencia',
    descripcion: 'Servicio de mantenimiento predictivo, preventivo y correctivo mayor a 48 subestaciones eléctricas en la División Peninsular y Sureste de CFE Distribución.',
    convocante: 'Comisión Federal de Electricidad',
    siglasConvocante: 'CFE',
    unidadCompradora: 'CFE Distribución · Gerencia Divisional de Distribución',
    materia: 'servicios',
    caracter: 'internacional_tlc',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'junta_aclaraciones',
    entidadFederativa: 'Yucatán',
    fechaPublicacion: '2026-08-14',
    fechaVisitaSitio: '2026-08-25',
    fechaJuntaAclaraciones: '2026-08-29',
    fechaLimitePropuestas: '2026-09-12T11:00:00',
    fechaFallo: '2026-09-29',
    montoEstimado: 128400000,
    moneda: 'MXN',
    marcoLegal: 'Disposiciones Generales en Materia de Adquisiciones de CFE Art. 24 y TLCAN/TMEC',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-CFE-045',
    requisitosClave: [
      'Certificación vigente en normas IEEE / IEC',
      'Personal técnico certificado con cédula profesional en ingeniería eléctrica',
      'Opinión de cumplimiento positiva SAT 32-D',
      'Garantía de cumplimiento del 10%',
      'Capacidad financiera acreditada con estados financieros auditados 2024-2025',
    ],
    anexosDisponibles: ['Pliego de Requisitos', 'Especificación Técnica CFE C-1000', 'Catálogo de Precios Unitarios'],
  },
  {
    id: 'lic-sict-2026-003',
    numeroProcedimiento: 'LO-009000999-E5-2026',
    expediente: 'EXP-SICT-DGC-2026-892',
    titulo: 'Construcción de puente vehicular de cuatro carriles y modernización del tramo carretero federal km 42+000 al km 68+500',
    descripcion: 'Trabajos de terracerías, obras de drenaje menor y mayor, pavimentación con concreto asfáltico, señalamiento horizontal y vertical, y construcción de estructura de puente vehicular con claros de 35 metros.',
    convocante: 'Secretaría de Infraestructura, Comunicaciones y Transportes',
    siglasConvocante: 'SICT',
    unidadCompradora: 'Dirección General de Carreteras · Centro SICT Jalisco',
    materia: 'obra_publica',
    caracter: 'nacional',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'visita_sitio',
    entidadFederativa: 'Jalisco',
    fechaPublicacion: '2026-08-16',
    fechaVisitaSitio: '2026-08-27',
    fechaJuntaAclaraciones: '2026-09-01',
    fechaLimitePropuestas: '2026-09-15T09:30:00',
    fechaFallo: '2026-09-30',
    montoEstimado: 342000000,
    moneda: 'MXN',
    marcoLegal: 'LOPSRM Art. 27 Fracc. I, Art. 30 y Art. 31',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-SICT-005',
    requisitosClave: [
      'Registro en el Padrón de Contratistas del Sector Público',
      'Constancia de visita al sitio de los trabajos firmada por el Centro SICT',
      'Análisis de precios unitarios desglosados (mano de obra, maquinaria, materiales)',
      'Experiencia comprobada en obras viales de similar complejidad en los últimos 5 años',
      'Garantía de anticipo (100%) y de cumplimiento (10%)',
    ],
    anexosDisponibles: ['Bases de Licitación LOPSRM', 'Proyecto Ejecutivo y Planos CAD', 'Catálogo de Conceptos'],
  },
  {
    id: 'lic-sat-2026-004',
    numeroProcedimiento: 'LA-06-E00-006E00001-N-38-2026',
    expediente: 'EXP-SAT-TI-2026-5541',
    titulo: 'Servicio integral de ciberseguridad gestionada, detección de amenazas (SOC/MDR) y protección de infraestructura crítica',
    descripcion: 'Contratación de servicios administrados de seguridad digital 24/7/365, centro de operaciones de seguridad (SOC), respuesta a incidentes cibernéticos y monitoreo continuo de plataformas tributarias.',
    convocante: 'Servicio de Administración Tributaria',
    siglasConvocante: 'SAT',
    unidadCompradora: 'Administración General de Comunicaciones y Tecnologías de la Información',
    materia: 'servicios',
    caracter: 'nacional',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'recepcion_propuestas',
    entidadFederativa: 'Ciudad de México',
    fechaPublicacion: '2026-08-08',
    fechaJuntaAclaraciones: '2026-08-18',
    fechaLimitePropuestas: '2026-08-31T12:00:00',
    fechaFallo: '2026-09-14',
    montoEstimado: 215000000,
    moneda: 'MXN',
    marcoLegal: 'LAASSP Art. 26 Fracc. I y Políticas de Seguridad Informática del SAT',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-SAT-038',
    requisitosClave: [
      'Certificaciones ISO/IEC 27001 e ISO/IEC 20000 del proveedor',
      'Personal certificado CISSP, CISM, CEH y GIAC asignado al proyecto',
      'Acuerdo de confidencialidad estricta y protocolo de no divulgación de datos tributarios',
      'Opinión 32-D SAT positiva',
      'Centro de datos alterno con redundancia Tier III o superior dentro de territorio nacional',
    ],
    anexosDisponibles: ['Convocatoria y Bases', 'Términos de Referencia de Ciberseguridad', 'Acuerdo de Niveles de Servicio (SLA)'],
  },
  {
    id: 'lic-pemex-2026-005',
    numeroProcedimiento: 'PMX-SA-PC-PEPR-0087-2026',
    expediente: 'EXP-PEMEX-PEP-2026-781',
    titulo: 'Arrendamiento integral de equipos de perforación terrestre y servicios de bombeo de fluidos para campos en la Región Norte',
    descripcion: 'Arrendamiento de 6 equipos de perforación terrestre de 1,500 a 2,000 HP, incluyendo personal operativo calificado, unidades de bombeo de alta presión y mantenimiento mayor en sitio.',
    convocante: 'Petróleos Mexicanos / PEMEX Exploración y Producción',
    siglasConvocante: 'PEMEX',
    unidadCompradora: 'Gerencia de Contrataciones para Exploración y Producción',
    materia: 'arrendamientos',
    caracter: 'internacional_abierta',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'junta_aclaraciones',
    entidadFederativa: 'Veracruz',
    fechaPublicacion: '2026-08-12',
    fechaJuntaAclaraciones: '2026-08-30',
    fechaLimitePropuestas: '2026-09-18T10:00:00',
    fechaFallo: '2026-10-05',
    montoEstimado: 45000000,
    moneda: 'USD',
    marcoLegal: 'Ley de Petróleos Mexicanos Art. 75 y Disposiciones Generales de Contratación de PEMEX',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-PEMEX-087',
    requisitosClave: [
      'Certificación API Spec Q2 para servicios de perforación',
      'Cumplimiento del Sistema de Seguridad, Salud en el Trabajo y Protección Ambiental (SSPA)',
      'Acreditación de propiedad o posesión legal de los equipos de perforación',
      'Garantía bancaria internacional de cumplimiento por el 10% del contrato',
    ],
    anexosDisponibles: ['Bases de Contratación Internacional', 'Especificación Técnica PEP-ET-044', 'Tabulador de Tarifas Diarias'],
  },
  {
    id: 'lic-issste-2026-006',
    numeroProcedimiento: 'LA-51-GYN-051GYN005-N-24-2026',
    expediente: 'EXP-ISSSTE-MED-2026-3021',
    titulo: 'Servicio integral de laboratorio clínico, banco de sangre y pruebas de tamizaje molecular para hospitales del ISSSTE',
    descripcion: 'Contratación de servicio subrogado de pruebas de análisis clínicos automatizados, biología molecular y procesamiento de hemocomponentes para unidades médicas hospitalarias regionales del ISSSTE.',
    convocante: 'Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
    siglasConvocante: 'ISSSTE',
    unidadCompradora: 'Dirección de Administración y Finanzas · Subdirección de Recursos Materiales',
    materia: 'servicios',
    caracter: 'nacional',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'recepcion_propuestas',
    entidadFederativa: 'Estado de México',
    fechaPublicacion: '2026-08-15',
    fechaJuntaAclaraciones: '2026-08-24',
    fechaLimitePropuestas: '2026-09-04T11:30:00',
    fechaFallo: '2026-09-22',
    montoEstimado: 380000000,
    moneda: 'MXN',
    marcoLegal: 'LAASSP Art. 26 Fracc. I y Art. 28',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-ISSSTE-024',
    requisitosClave: [
      'Acreditación ante la Entidad Mexicana de Acreditación (EMA) bajo NMX-EC-15189-IMNC',
      'Licencia sanitaria vigente expedida por COFEPRIS',
      'Opinión positiva SAT 32-D',
      'Capacidad de entrega de reactivos y equipamiento en comodato en un plazo no mayor a 15 días',
    ],
    anexosDisponibles: ['Bases Oficiales', 'Catálogo de Pruebas y Volúmenes Estimados', 'Términos de Referencia Hospitalarios'],
  },
  {
    id: 'lic-conagua-2026-007',
    numeroProcedimiento: 'LO-016B00001-E18-2026',
    expediente: 'EXP-CONAGUA-OCAVM-2026-419',
    titulo: 'Rehabilitación y mantenimiento mayor de plantas de bombeo del Sistema Cutzamala y sustitución de tuberías de presión',
    descripcion: 'Trabajos de conservación estructural, sustitución de válvulas de seccionamiento de 99 pulgadas, mantenimiento a bombas centrifugas de alta presión e instalación de instrumentación telemétrica.',
    convocante: 'Comisión Nacional del Agua',
    siglasConvocante: 'CONAGUA',
    unidadCompradora: 'Organismo de Cuenca Aguas del Valle de México (OCAVM)',
    materia: 'obra_publica',
    caracter: 'nacional',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'junta_aclaraciones',
    entidadFederativa: 'Estado de México',
    fechaPublicacion: '2026-08-11',
    fechaVisitaSitio: '2026-08-22',
    fechaJuntaAclaraciones: '2026-08-28',
    fechaLimitePropuestas: '2026-09-08T10:00:00',
    fechaFallo: '2026-09-25',
    montoEstimado: 275000000,
    moneda: 'MXN',
    marcoLegal: 'LOPSRM Art. 27 Fracc. I y Art. 30',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-CONAGUA-018',
    requisitosClave: [
      'Constancia de asistencia obligatoria a la visita de campo al Sistema Cutzamala',
      'Currículum empresarial acreditando ejecución de proyectos hidráulicos de gran calado',
      'Cumplimiento ambiental y manifiesto de no encontrarse en supuestos del Art. 51 de la LOPSRM',
      'Garantía de seriedad de la postura',
    ],
    anexosDisponibles: ['Convocatoria y Bases LOPSRM', 'Planos de Ingeniería Hidráulica', 'Especificaciones de Calidad OCAVM'],
  },
  {
    id: 'lic-sep-2026-008',
    numeroProcedimiento: 'LA-11-000-011000999-N-52-2026',
    expediente: 'EXP-SEP-DGMME-2026-118',
    titulo: 'Impresión, encuadernación y distribución nacional de libros de texto gratuitos y materiales didácticos para educación básica',
    descripcion: 'Servicio integral de producción editorial industrial para 32 millones de ejemplares, incluyendo papel de alta resistencia, tinta ecológica, embalaje clasificado por zona escolar y flete asegurado a almacenes estatales.',
    convocante: 'Secretaría de Educación Pública / CONALITEG',
    siglasConvocante: 'SEP',
    unidadCompradora: 'Comisión Nacional de Libros de Texto Gratuitos (CONALITEG)',
    materia: 'adquisiciones',
    caracter: 'nacional',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'recepcion_propuestas',
    entidadFederativa: 'Querétaro',
    fechaPublicacion: '2026-08-17',
    fechaJuntaAclaraciones: '2026-08-26',
    fechaLimitePropuestas: '2026-09-07T12:00:00',
    fechaFallo: '2026-09-21',
    montoEstimado: 560000000,
    moneda: 'MXN',
    marcoLegal: 'LAASSP Art. 26 Fracc. I, Art. 28 Fracc. I',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-SEP-052',
    requisitosClave: [
      'Capacidad de producción comprobable mínima de 500,000 ejemplares diarios',
      'Certificación Forest Stewardship Council (FSC) en el papel suministrado',
      'Opinión 32-D SAT positiva',
      'Póliza de flete y seguro contra daños de transporte en tránsito nacional',
    ],
    anexosDisponibles: ['Bases del Procedimiento', 'Ficha Técnica de Gramaje y Tintas', 'Distribución Logística por Entidad'],
  },
  {
    id: 'lic-bienestar-2026-009',
    numeroProcedimiento: 'LA-20-000-020000999-N-16-2026',
    expediente: 'EXP-BIENESTAR-2026-641',
    titulo: 'Servicio de arrendamiento de vehículos operativos y camionetas tipo pick-up para brigadas territoriales de programas sociales',
    descripcion: 'Arrendamiento puro de 1,200 unidades vehiculares modelo 2026, con kilometraje ilimitado, seguro de cobertura amplia, rastreo satelital GPS activo y mantenimiento preventivo periódico en las 32 entidades federativas.',
    convocante: 'Secretaría de Bienestar',
    siglasConvocante: 'Bienestar',
    unidadCompradora: 'Dirección General de Recursos Materiales y Servicios Generales',
    materia: 'arrendamientos',
    caracter: 'nacional',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'convocatoria_publicada',
    entidadFederativa: 'Ciudad de México',
    fechaPublicacion: '2026-08-21',
    fechaJuntaAclaraciones: '2026-09-03',
    fechaLimitePropuestas: '2026-09-17T11:00:00',
    fechaFallo: '2026-09-30',
    montoEstimado: 410000000,
    moneda: 'MXN',
    marcoLegal: 'LAASSP Art. 26 Fracc. I, Art. 27 y Art. 28',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-BIENESTAR-016',
    requisitosClave: [
      'Flotilla vehicular 100% modelo 2026 con entrega escalonada en 30 días',
      'Cobertura de asistencia en el camino y talleres autorizados en todos los estados',
      'Opinión SAT 32-D, IMSS e INFONAVIT en sentido positivo',
      'Plataforma web de telemetría y reportes de combustible en tiempo real',
    ],
    anexosDisponibles: ['Convocatoria a la Licitación', 'Especificaciones de Flotilla', 'Convenio de Arrendamiento'],
  },
  {
    id: 'lic-guardia-2026-010',
    numeroProcedimiento: 'LA-36-000-036000999-N-09-2026',
    expediente: 'EXP-GN-LOG-2026-883',
    titulo: 'Adquisición de vestuario, calzado táctico y equipo de protección personal para cuerpos de seguridad',
    descripcion: 'Suministro de 95,000 conjuntos de uniformes reglamentarios de alta durabilidad con especificaciones de resistencia a la abrasión, impermeabilidad y botas tácticas ergonómicas.',
    convocante: 'Guardia Nacional / Secretaría de la Defensa Nacional',
    siglasConvocante: 'GN / Sedena',
    unidadCompradora: 'Dirección General de Logística y Adquisiciones',
    materia: 'adquisiciones',
    caracter: 'nacional',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'recepcion_propuestas',
    entidadFederativa: 'Ciudad de México',
    fechaPublicacion: '2026-08-13',
    fechaJuntaAclaraciones: '2026-08-22',
    fechaLimitePropuestas: '2026-09-01T10:00:00',
    fechaFallo: '2026-09-15',
    montoEstimado: 320000000,
    moneda: 'MXN',
    marcoLegal: 'LAASSP Art. 26 Fracc. I y Normas Militares de Calidad',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-GN-009',
    requisitosClave: [
      'Pruebas de laboratorio acreditadas ante EMA para tejidos y resistencia balística no letal',
      'Fabricante nacional con capacidad instalada verificada',
      'Opinión 32-D SAT positiva',
      'Muestras físicas selladas entregadas en acto de presentación de propuestas',
    ],
    anexosDisponibles: ['Bases de Licitación', 'Fichas Técnicas de Textiles', 'Protocolo de Pruebas Destructivas'],
  },
  {
    id: 'lic-sct-puertos-2026-011',
    numeroProcedimiento: 'LO-009J3A001-E29-2026',
    expediente: 'EXP-ASIPONA-VER-2026-210',
    titulo: 'Dragado de mantenimiento y profundización de canales de navegación en el Recinto Portuario de Veracruz',
    descripcion: 'Servicios de dragado hidráulico y mecánico para extracción y vertido controlado de 1.8 millones de metros cúbicos de material en dársenas y canales de acceso.',
    convocante: 'Administración del Sistema Portuario Nacional Veracruz (ASIPONA)',
    siglasConvocante: 'ASIPONA Veracruz',
    unidadCompradora: 'Gerencia de Ingeniería y Mantenimiento Portuario',
    materia: 'servicios_obra',
    caracter: 'internacional_tlc',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'junta_aclaraciones',
    entidadFederativa: 'Veracruz',
    fechaPublicacion: '2026-08-18',
    fechaVisitaSitio: '2026-08-26',
    fechaJuntaAclaraciones: '2026-09-02',
    fechaLimitePropuestas: '2026-09-16T12:00:00',
    fechaFallo: '2026-10-02',
    montoEstimado: 195000000,
    moneda: 'MXN',
    marcoLegal: 'LOPSRM Art. 27 Fracc. I y Ley de Puertos',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-ASIPONA-029',
    requisitosClave: [
      'Embarcación draga de tolva autopropulsada con matrícula y permisos de Capitanía de Puerto',
      'Manifiesto de Impacto Ambiental (MIA) SEMARNAT vigente',
      'Personal técnico con libreta de mar vigente y experiencia marítima',
      'Fianza de cumplimiento y vicios ocultos',
    ],
    anexosDisponibles: ['Bases y Términos de Referencia', 'Estudio Batimétrico Oficial', 'Plan de Manejo Ambiental'],
  },
  {
    id: 'lic-cdmx-sobse-2026-012',
    numeroProcedimiento: 'LPN-SOBSE-DGCUR-04-2026',
    expediente: 'EXP-CDMX-SOBSE-2026-1033',
    titulo: 'Mantenimiento integral y rehabilitación del sistema de iluminación y ciclovías en calzadas primarias de la Ciudad de México',
    descripcion: 'Suministro e instalación de 18,500 luminarias LED solares e inteligentes con protocolo DALI, balizamiento reflectante termoplástico y confinadores viales de caucho reciclado en 65 km de ciclovías.',
    convocante: 'Gobierno de la Ciudad de México / Secretaría de Obras y Servicios (SOBSE)',
    siglasConvocante: 'SOBSE CDMX',
    unidadCompradora: 'Dirección General de Construcción de Obras Públicas',
    materia: 'obra_publica',
    caracter: 'nacional',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'recepcion_propuestas',
    entidadFederativa: 'Ciudad de México',
    fechaPublicacion: '2026-08-14',
    fechaJuntaAclaraciones: '2026-08-23',
    fechaLimitePropuestas: '2026-09-03T10:00:00',
    fechaFallo: '2026-09-17',
    montoEstimado: 148000000,
    moneda: 'MXN',
    marcoLegal: 'Ley de Obras Públicas del Distrito Federal y Normas Técnicas Complementarias',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-SOBSE-004',
    requisitosClave: [
      'Padrón de Contratistas del Gobierno de la CDMX vigente',
      'Opinión favorable de cumplimiento de obligaciones fiscales locales (Secretaría de Finanzas CDMX)',
      'Garantía de las luminarias LED por un mínimo de 10 años',
    ],
    anexosDisponibles: ['Bases Locales LPN', 'Ficha Técnica de Luminarias', 'Tramos Viales a Intervenir'],
  },
  {
    id: 'lic-inaoep-2026-013',
    numeroProcedimiento: 'LA-38-908-038908999-I-03-2026',
    expediente: 'EXP-INAOE-CIENCIA-2026-44',
    titulo: 'Adquisición de espectrómetro óptico de alta resolución criogénico para investigación astrofísica avanzada',
    descripcion: 'Suministro, calibración in situ, capacitación especializada y garantía extendida para espectrómetro de alta dispersión con detector CCD de 4k x 4k refrigerado por nitrógeno líquido.',
    convocante: 'Instituto Nacional de Astrofísica, Óptica y Electrónica (INAOE / CONAHCYT)',
    siglasConvocante: 'INAOE',
    unidadCompradora: 'Departamento de Astrofísica y Óptica',
    materia: 'adquisiciones',
    caracter: 'internacional_abierta',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'junta_aclaraciones',
    entidadFederativa: 'Puebla',
    fechaPublicacion: '2026-08-19',
    fechaJuntaAclaraciones: '2026-09-04',
    fechaLimitePropuestas: '2026-09-24T13:00:00',
    fechaFallo: '2026-10-10',
    montoEstimado: 1850000,
    moneda: 'USD',
    marcoLegal: 'LAASSP Art. 26 Fracc. I, Art. 28 Fracc. III (Internacional Abierta)',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-INAOE-003',
    requisitosClave: [
      'Fabricante internacional con soporte técnico autorizado en México',
      'Cumplimiento de tolerancias ópticas micrométricas certificadas en fábrica',
      'Carta de compromiso de refacciones por 10 años',
    ],
    anexosDisponibles: ['Bases Internacionales en Español e Inglés', 'Especificaciones de Criogenia', 'Protocolo de Pruebas en Laboratorio'],
  },
  {
    id: 'lic-jalisco-salud-2026-014',
    numeroProcedimiento: 'LPN-SSJ-OPD-019-2026',
    expediente: 'EXP-SSJ-HOSP-2026-551',
    titulo: 'Servicio de limpieza hospitalaria, sanitización y manejo de residuos peligrosos biológico-infecciosos (RPBI)',
    descripcion: 'Servicio integral de desinfección de quirófanos, áreas críticas de terapia intensiva, hospitalización y recolección certificada de RPBI en 36 unidades hospitalarias del OPD Servicios de Salud Jalisco.',
    convocante: 'Organismo Público Descentralizado Servicios de Salud Jalisco',
    siglasConvocante: 'SSJ Jalisco',
    unidadCompradora: 'Dirección de Recursos Materiales · Servicios de Salud Jalisco',
    materia: 'servicios',
    caracter: 'nacional',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'recepcion_propuestas',
    entidadFederativa: 'Jalisco',
    fechaPublicacion: '2026-08-12',
    fechaJuntaAclaraciones: '2026-08-21',
    fechaLimitePropuestas: '2026-09-01T11:00:00',
    fechaFallo: '2026-09-16',
    montoEstimado: 89000000,
    moneda: 'MXN',
    marcoLegal: 'Ley de Compras Gubernamentales del Estado de Jalisco y NOM-087-SEMARNAT-SSA1-2002',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-SSJ-019',
    requisitosClave: [
      'Permiso SEMARNAT y SCT para transporte de RPBI',
      'Certificación del personal en bioseguridad y manejo de químicos hospitalarios',
      'Padrón de Proveedores del Estado de Jalisco activo',
      'Constancia fiscal positiva 32-D SAT',
    ],
    anexosDisponibles: ['Bases Estatales', 'Catálogo de Hospitales y Metros Cuadrados', 'Protocolos NOM-087'],
  },
  {
    id: 'lic-nl-movilidad-2026-015',
    numeroProcedimiento: 'LPN-STC-METRORREY-008-2026',
    expediente: 'EXP-METRORREY-2026-8801',
    titulo: 'Adquisición de sistemas de peaje electrónico inteligente, validadores sin contacto y torniquetes de acceso para Metro y Transmetro',
    descripcion: 'Suministro e instalación de 450 validadores con soporte para tarjetas inteligentes MI Movilidad, tarjetas bancarias contactless EMV y códigos QR dinámicos, incluyendo software de compensación central.',
    convocante: 'Sistema de Transporte Colectivo Metrorrey',
    siglasConvocante: 'Metrorrey',
    unidadCompradora: 'Gerencia de Adquisiciones y Contratos',
    materia: 'adquisiciones',
    caracter: 'internacional_tlc',
    tipoProcedimiento: 'licitacion_publica',
    estatus: 'junta_aclaraciones',
    entidadFederativa: 'Nuevo León',
    fechaPublicacion: '2026-08-16',
    fechaJuntaAclaraciones: '2026-08-29',
    fechaLimitePropuestas: '2026-09-14T10:30:00',
    fechaFallo: '2026-09-28',
    montoEstimado: 165000000,
    moneda: 'MXN',
    marcoLegal: 'Ley de Adquisiciones del Estado de Nuevo León y Capítulos de Compras del TMEC',
    enlaceCompraNet: 'https://compranet.hacienda.gob.mx/esop/guest/go/opportunity/detail?opportunityId=2026-METRORREY-008',
    requisitosClave: [
      'Certificación EMVCo L1 y L2 en los lectores de pago',
      'Garantía de disponibilidad del software central 99.95%',
      'Registro en el padrón estatal de proveedores de Nuevo León',
      'Acreditación de proyectos similares en transporte masivo en los últimos 4 años',
    ],
    anexosDisponibles: ['Convocatoria y Bases LPN', 'Arquitectura Tecnológica Metrorrey', 'Protocolos de Comunicación Segura'],
  },
];

export const LICITACIONES_STATS = {
  total: LICITACIONES_DATA.length,
  convocantes: new Set(LICITACIONES_DATA.map((l) => l.convocante)).size,
  entidades: new Set(LICITACIONES_DATA.map((l) => l.entidadFederativa)).size,
};

export function getAvailableConvocantes(): Array<{ siglas: string; nombre: string }> {
  const map = new Map<string, string>();
  for (const item of LICITACIONES_DATA) {
    if (!map.has(item.siglasConvocante)) {
      map.set(item.siglasConvocante, item.convocante);
    }
  }
  return Array.from(map.entries()).map(([siglas, nombre]) => ({ siglas, nombre }));
}

export function getAvailableEntidades(): string[] {
  const set = new Set(LICITACIONES_DATA.map((l) => l.entidadFederativa));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es-MX'));
}

export function formatCurrency(amount: number, currency: 'MXN' | 'USD'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  try {
    const cleanDateStr = isoString.split('T')[0];
    const parts = cleanDateStr.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      const [year, month, day] = parts;
      const date = new Date(year, month - 1, day, 12, 0, 0);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    const date = new Date(isoString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const dateStr = formatDate(isoString);
    const timeStr = date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} · ${timeStr} hrs`;
  } catch {
    return isoString;
  }
}

export interface DaysRemainingInfo {
  days: number;
  isExpired: boolean;
  label: string;
  badgeStyle: 'urgent' | 'warning' | 'open';
}

export function getDaysRemaining(isoString: string): DaysRemainingInfo {
  try {
    const target = new Date(isoString).getTime();
    const now = Date.now();
    const diffMs = target - now;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return {
        days: 0,
        isExpired: true,
        label: 'Plazo vencido / En evaluación',
        badgeStyle: 'urgent',
      };
    }

    if (days <= 3) {
      return {
        days,
        isExpired: false,
        label: `Cierra en ${days} ${days === 1 ? 'día' : 'días'}`,
        badgeStyle: 'urgent',
      };
    }

    if (days <= 7) {
      return {
        days,
        isExpired: false,
        label: `Cierra en ${days} días`,
        badgeStyle: 'warning',
      };
    }

    return {
      days,
      isExpired: false,
      label: `Cierra en ${days} días`,
      badgeStyle: 'open',
    };
  } catch {
    return {
      days: 0,
      isExpired: false,
      label: 'Fecha por confirmar',
      badgeStyle: 'open',
    };
  }
}
