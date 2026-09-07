import type { LegalModule, LegalTemplate } from '../types';

export const PWA_MODULE_CONFIG: Record<LegalModule, {
  label: string;
  shortLabel: string;
  description: string;
  colorHex: string;
  badgeClass: string;
  activeClass: string;
  borderClass: string;
}> = {
  mercantil: {
    label: 'Mercantil y Corporativo',
    shortLabel: 'Mercantil',
    description: 'Contratos, pagarés, compraventa, distribución, actas de asamblea y cesión de derechos.',
    colorHex: '#1E3A5F',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    activeClass: 'border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-600/20',
    borderClass: 'border-blue-500',
  },
  laboral: {
    label: 'Laboral y Empleo',
    shortLabel: 'Laboral',
    description: 'Contratos individuales, teletrabajo, confidencialidad, finiquitos y no competencia.',
    colorHex: '#D97706',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    activeClass: 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20',
    borderClass: 'border-amber-500',
  },
  fiscal: {
    label: 'Fiscal y SAT',
    shortLabel: 'Fiscal',
    description: 'Servicios con retenciones, mutuo, aclaraciones SAT, arrendamiento y contratos REPSE.',
    colorHex: '#1A3C34',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    activeClass: 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20',
    borderClass: 'border-emerald-500',
  },
  comercio_exterior: {
    label: 'Comercio Exterior',
    shortLabel: 'Comercio Ext.',
    description: 'Compraventa internacional CISG/Incoterms, avisos de privacidad y fletes aduaneros.',
    colorHex: '#0284C7',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    activeClass: 'border-sky-600 bg-sky-50/70 text-sky-950 ring-2 ring-sky-600/20',
    borderClass: 'border-sky-500',
  },
  aduanal: {
    label: 'Aduanal y Despacho',
    shortLabel: 'Aduanal',
    description: 'Servicios de agente aduanal, carta encomienda, poderes especiales, manifestación de valor y rectificaciones.',
    colorHex: '#7C3AED',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    activeClass: 'border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-600/20',
    borderClass: 'border-purple-500',
  },
};

export const PWA_LEGAL_TEMPLATES: LegalTemplate[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // ── 1. MERCANTIL Y CORPORATIVO ─────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'mercantil-pagare',
    title: 'Pagaré Mercantil con Aval y Moratorios',
    description: 'Título de crédito con cláusula de intereses moratorios, lugar de pago y designación de aval conforme a la LGTOC.',
    module: 'mercantil',
    intentGroup: 'Cobrar / Garantizar',
    outputLabel: 'Pagaré Mercantil',
    fields: [
      { id: 'numero_pagare', label: 'Número de Pagaré / Consecutivo', placeholder: '1 / 1', type: 'text', defaultValue: '1 de 1', required: true },
      { id: 'lugar_suscripcion', label: 'Lugar de Suscripción', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_suscripcion', label: 'Fecha de Suscripción', type: 'date', required: true },
      { id: 'monto_numero', label: 'Monto en Número ($ MXN / USD)', placeholder: '500,000.00', type: 'currency', required: true },
      { id: 'monto_letra', label: 'Monto en Letra', placeholder: 'Quinientos mil pesos 00/100 M.N.', type: 'text', required: true },
      { id: 'fecha_pago', label: 'Fecha de Vencimiento / Pago', type: 'date', required: true },
      { id: 'lugar_pago', label: 'Lugar y Domicilio de Pago', placeholder: 'Av. Insurgentes Sur 1602, Benito Juárez, CDMX', type: 'text', required: true },
      { id: 'nombre_acreedor', label: 'Nombre del Beneficiario / Acreedor', placeholder: 'Operadora Financiera Mexicana, S.A. de C.V.', type: 'text', required: true },
      { id: 'nombre_deudor', label: 'Nombre del Suscriptor / Deudor', placeholder: 'Juan Pérez López', type: 'text', required: true },
      { id: 'domicilio_deudor', label: 'Domicilio del Suscriptor', placeholder: 'Calle Morelos 45, Col. Centro, CDMX', type: 'text', required: true },
      { id: 'tasa_moratoria', label: 'Tasa de Interés Moratorio Mensual (%)', placeholder: '3.5', type: 'number', defaultValue: '3.0', required: true },
      { id: 'nombre_aval', label: 'Nombre del Aval (Opcional)', placeholder: 'María Gómez Estrada', type: 'text' },
      { id: 'domicilio_aval', label: 'Domicilio del Aval', placeholder: 'Av. Paseo de la Reforma 222, CDMX', type: 'text' },
    ],
    toggles: [
      {
        id: 'vencimiento_anticipado',
        label: 'Cláusula de Vencimiento Anticipado',
        description: 'Permite hacer exigible el saldo total si se suscribe como serie y se incumple un pago.',
        defaultActive: true,
        content: '\nEl suscriptor conviene en que si el presente pagaré no es pagado a su vencimiento, o si forma parte de una serie y se deja de pagar uno cualquiera de ellos, se darán por vencidos anticipadamente todos los pagarés subsecuentes de la serie.',
      },
    ],
    templateHandlebars: `PAGARÉ MERCANTIL No. {{numero_pagare}}

BUENO POR: $ {{monto_numero}}

En {{lugar_suscripcion}}, a {{fecha_suscripcion}}.

Debo y pagaré incondicionalmente por este Pagaré a la orden de {{nombre_acreedor}}, en el domicilio ubicado en {{lugar_pago}}, el día {{fecha_pago}}, la cantidad de $ {{monto_numero}} ({{monto_letra}}), valor recibido a mi entera satisfacción.

La suma que ampara este título de crédito causará intereses moratorios a razón del {{tasa_moratoria}}% mensual desde la fecha de su vencimiento hasta el día de su total y efectiva liquidación, pagaderos conjuntamente con el principal.{{#if toggle_vencimiento_anticipado}}{{toggle_vencimiento_anticipado}}{{/if}}

Para todo lo relativo a la interpretación, cumplimiento y ejecución de este pagaré, el suscriptor se somete expresamente a la jurisdicción de los tribunales competentes de {{lugar_suscripcion}}, renunciando a cualquier otro fuero que pudiera corresponderle por razón de su domicilio presente o futuro.

SUSCRIPTOR (DEUDOR):
Nombre: {{nombre_deudor}}
Domicilio: {{domicilio_deudor}}

Firma: ________________________________________

{{#if nombre_aval}}
AVAL:
Por este pagaré me constituyo en avalista y obligado solidario del suscriptor {{nombre_deudor}}, pagando incondicionalmente a la orden del beneficiario en los mismos términos y condiciones estipulados.

Nombre del Aval: {{nombre_aval}}
Domicilio del Aval: {{domicilio_aval}}

Firma del Aval: ________________________________________
{{/if}}
`,
  },
  {
    id: 'mercantil-compraventa',
    title: 'Contrato de Compraventa Mercantil de Bienes',
    description: 'Compraventa mercantil de bienes muebles con estipulación de entrega, vicios ocultos, saneamiento y reserva de dominio (Art. 371 CCom / Art. 2312 CCF).',
    module: 'mercantil',
    intentGroup: 'Comprar / Vender',
    outputLabel: 'Compraventa Mercantil',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'vendedor_nombre', label: 'Nombre o Razón Social del Vendedor', placeholder: 'Comercializadora Industrial del Norte, S.A. de C.V.', type: 'text', required: true },
      { id: 'vendedor_rfc', label: 'RFC del Vendedor', placeholder: 'CIN160520ABC', type: 'text', required: true },
      { id: 'vendedor_domicilio', label: 'Domicilio del Vendedor', placeholder: 'Av. Paseo de los Leones 1200, Monterrey, N.L.', type: 'text', required: true },
      { id: 'vendedor_rep', label: 'Representante Legal del Vendedor', placeholder: 'Lic. Rodrigo Garza Sada', type: 'text', required: true },
      { id: 'comprador_nombre', label: 'Nombre o Razón Social del Comprador', placeholder: 'Manufacturas y Procesos del Centro, S.A. de C.V.', type: 'text', required: true },
      { id: 'comprador_rfc', label: 'RFC del Comprador', placeholder: 'MPC180911XYZ', type: 'text', required: true },
      { id: 'comprador_domicilio', label: 'Domicilio del Comprador', placeholder: 'Blvd. Aeropuerto 500, Parque Industrial Toluca 2000, Edo. Méx.', type: 'text', required: true },
      { id: 'comprador_rep', label: 'Representante Legal del Comprador', placeholder: 'Ing. Mónica Villarreal Flores', type: 'text', required: true },
      { id: 'descripcion_mercancia', label: 'Descripción Detallada de los Bienes / Mercancías', placeholder: '10 Bombas Hidráulicas Industriales de Alta Presión Marca HydroTech Mod. HT-5000 con manuales y accesorios', type: 'textarea', required: true },
      { id: 'cantidad_unidades', label: 'Cantidad y Unidad de Medida', placeholder: '10 Unidades', type: 'text', defaultValue: '10 piezas', required: true },
      { id: 'fraccion_arancelaria', label: 'Fracción Arancelaria (Opcional)', placeholder: '8413.50.01', type: 'text' },
      { id: 'precio_total', label: 'Precio Total de la Operación ($ MXN / USD)', placeholder: '850,000.00 MXN', type: 'currency', required: true },
      { id: 'precio_letra', label: 'Precio en Letra', placeholder: 'Ochocientos cincuenta mil pesos 00/100 M.N.', type: 'text', required: true },
      { id: 'pago_inicial', label: 'Monto de Pago Inicial / Anticipo', placeholder: '$425,000.00 M.N. (50%) a la firma', type: 'text', defaultValue: '50% a la firma del contrato', required: true },
      { id: 'saldo_restante', label: 'Saldo Restante y Condiciones de Liquidación', placeholder: '$425,000.00 M.N. contra entrega a satisfacción', type: 'text', defaultValue: 'Saldo contra entrega física', required: true },
      { id: 'cuenta_bancaria_pago', label: 'Banco y Cuenta / CLABE para Pagos', placeholder: 'BBVA México · CLABE: 012180001234567890', type: 'text', required: true },
      { id: 'domicilio_entrega', label: 'Lugar / Domicilio de Entrega', placeholder: 'Almacén Central en Blvd. Aeropuerto 500, Toluca', type: 'text', required: true },
      { id: 'plazo_entrega_dias', label: 'Plazo de Entrega (Días Hábiles)', placeholder: '10', type: 'number', defaultValue: '10', required: true },
      { id: 'plazo_vicios_ocultos_dias', label: 'Plazo de Reclamo por Vicios Ocultos (Días)', placeholder: '30', type: 'number', defaultValue: '30', required: true },
      { id: 'pena_porcentaje', label: 'Pena Convencional por Incumplimiento (%)', placeholder: '10.0', type: 'number', defaultValue: '10.0', required: true },
    ],
    toggles: [
      {
        id: 'reserva_dominio',
        label: 'Cláusula de Reserva de Dominio (Art. 2312 CCF)',
        description: 'El vendedor conserva la propiedad jurídica de los bienes hasta que el comprador liquide el 100% del precio.',
        defaultActive: true,
        content: '\nCLÁUSULA ESPECIAL.- RESERVA DE DOMINIO. Las Partes pactan expresamente, con fundamento en el artículo 2312 del Código Civil Federal y disposiciones mercantiles correlativas, que EL VENDEDOR conservará el dominio y la propiedad de los bienes vendidos hasta que EL COMPRADOR haya pagado la totalidad del precio pactado. Mientras subsista la reserva de dominio, EL COMPRADOR no podrá enajenar, gravar ni disponer de los bienes sin autorización expresa y por escrito de EL VENDEDOR.',
      },
    ],
    templateHandlebars: `CONTRATO DE COMPRAVENTA MERCANTIL DE BIENES

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{vendedor_nombre}}, con RFC {{vendedor_rfc}}, representada por {{vendedor_rep}} (en lo sucesivo, "EL VENDEDOR"), y por la otra parte {{comprador_nombre}}, con RFC {{comprador_rfc}}, representada por {{comprador_rep}} (en lo sucesivo, "EL COMPRADOR"), al tenor de las siguientes:

DECLARACIONES

I. Declara EL VENDEDOR ser una persona legalmente constituida conforme a las leyes mexicanas, con domicilio en {{vendedor_domicilio}}, ser legítimo propietario de los bienes objeto del contrato y contar con facultades para enajenarlos libres de todo gravamen.
II. Declara EL COMPRADOR ser una persona legalmente constituida conforme a las leyes mexicanas, con domicilio en {{comprador_domicilio}}, con interés y capacidad jurídica y económica para adquirir los bienes descritos.
III. Declaran ambas Partes que celebran el presente contrato de compraventa mercantil de conformidad con los artículos 75 fracción I, 77, 78 y 371 del Código de Comercio y supletoriamente el Código Civil Federal.

CLÁUSULAS

PRIMERA.- OBJETO. EL VENDEDOR transfiere la propiedad de los bienes a favor de EL COMPRADOR, quien se obliga a pagar el precio convenido.
- Descripción de los bienes: {{descripcion_mercancia}}
- Cantidad: {{cantidad_unidades}}
{{#if fraccion_arancelaria}}- Fracción arancelaria aplicable: {{fraccion_arancelaria}}{{/if}}

SEGUNDA.- PRECIO Y FORMA DE PAGO. El precio total de la operación es de $ {{precio_total}} ({{precio_letra}}), más el IVA correspondiente, pagadero de la siguiente forma:
- Pago inicial: {{pago_inicial}}
- Saldo restante: {{saldo_restante}}
Los pagos se realizarán mediante transferencia electrónica a: {{cuenta_bancaria_pago}}.

TERCERA.- ENTREGA Y TRANSMISIÓN DE RIESGO. La entrega material se realizará en {{domicilio_entrega}}, dentro de los {{plazo_entrega_dias}} días hábiles siguientes a la confirmación del pago inicial. El riesgo de pérdida o deterioro se transmite en el momento de la entrega material.{{#if toggle_reserva_dominio}}{{toggle_reserva_dominio}}{{/if}}

CUARTA.- VICIOS OCULTOS Y SANEAMIENTO. EL VENDEDOR responde por los defectos o vicios ocultos de los bienes conforme a los artículos 2142 al 2155 del Código Civil Federal y Código de Comercio. El plazo para formular reclamaciones por vicios ocultos será de {{plazo_vicios_ocultos_dias}} días naturales posteriores a la recepción física.

QUINTA.- PENA CONVENCIONAL. En caso de incumplimiento de cualquiera de las obligaciones, la Parte incumplida pagará una pena convencional equivalente al {{pena_porcentaje}}% del valor total de la operación, sin perjuicio de exigir el cumplimiento forzoso o la rescisión y el pago de daños y perjuicios.

SEXTA.- JURISDICCIÓN. Para la interpretación y cumplimiento de este contrato, las Partes se someten expresamente a los tribunales competentes de {{ciudad_firma}}, renunciando a cualquier otro fuero.

POR EL VENDEDOR:
{{vendedor_nombre}}
Por: {{vendedor_rep}}
Firma: ________________________________________

POR EL COMPRADOR:
{{comprador_nombre}}
Por: {{comprador_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'mercantil-comision',
    title: 'Contrato de Comisión Mercantil',
    description: 'Regulación de actos de comercio por cuenta del comitente con cálculo de comisiones, territorio, rendición de cuentas y sin subordinación laboral (Arts. 273-308 CCom).',
    module: 'mercantil',
    intentGroup: 'Intermediar / Vender',
    outputLabel: 'Comisión Mercantil',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'comitente_nombre', label: 'Nombre o Razón Social del Comitente', placeholder: 'Grupo Comercializador de Tecnología, S.A. de C.V.', type: 'text', required: true },
      { id: 'comitente_rfc', label: 'RFC del Comitente', placeholder: 'GCT170412ABC', type: 'text', required: true },
      { id: 'comitente_domicilio', label: 'Domicilio del Comitente', placeholder: 'Av. Insurgentes Sur 1602, Piso 10, Crédito Constructor, CDMX', type: 'text', required: true },
      { id: 'comitente_rep', label: 'Representante Legal del Comitente', placeholder: 'Lic. Fernando Morales Treviño', type: 'text', required: true },
      { id: 'comisionista_nombre', label: 'Nombre o Razón Social del Comisionista', placeholder: 'Promociones y Representaciones Comerciales SC', type: 'text', required: true },
      { id: 'comisionista_rfc', label: 'RFC del Comisionista', placeholder: 'PRC190820XYZ', type: 'text', required: true },
      { id: 'comisionista_domicilio', label: 'Domicilio del Comisionista', placeholder: 'Calle Colima 230, Roma Norte, Cuauhtémoc, CDMX', type: 'text', required: true },
      { id: 'comisionista_rep', label: 'Representante del Comisionista', placeholder: 'Lic. Alejandro Silva Rivas', type: 'text', required: true },
      { id: 'objeto_comision', label: 'Actos de Comercio Encomendados', placeholder: 'La promoción, negociación y cierre de ventas de licencias de software y servicios de consultoría digital', type: 'textarea', required: true },
      { id: 'territorio', label: 'Territorio Asignado', placeholder: 'Zona Metropolitana de la Ciudad de México y Estado de México', type: 'text', defaultValue: 'República Mexicana', required: true },
      { id: 'porcentaje_comision', label: 'Porcentaje de Comisión (%)', placeholder: '12.5', type: 'number', defaultValue: '10.0', required: true },
      { id: 'base_calculo', label: 'Base de Cálculo de la Comisión', placeholder: 'Valor neto efectivamente cobrado de las operaciones cerradas, antes de IVA', type: 'text', defaultValue: 'Monto neto efectivamente cobrado', required: true },
      { id: 'dias_pago_comision', label: 'Plazo para Pago de Comisiones (Días Naturales)', placeholder: '10', type: 'number', defaultValue: '15', required: true },
      { id: 'cuenta_clabe_comisionista', label: 'Cuenta y CLABE del Comisionista', placeholder: 'BBVA · CLABE: 012180009876543210', type: 'text', required: true },
      { id: 'dias_rendicion_cuentas', label: 'Días de Rendición de Cuentas Mensual (Primeros X Días)', placeholder: '5', type: 'number', defaultValue: '5', required: true },
      { id: 'vigencia_meses', label: 'Vigencia del Contrato (Meses)', placeholder: '12', type: 'number', defaultValue: '12', required: true },
    ],
    toggles: [
      {
        id: 'exclusividad_territorial',
        label: 'Cláusula de Exclusividad y No Competencia en el Territorio',
        description: 'Obliga al comisionista a no promover productos competidores durante la vigencia del contrato.',
        defaultActive: true,
        content: '\nCLÁUSULA ESPECIAL.- NO COMPETENCIA Y EXCLUSIVIDAD. Durante la vigencia del presente contrato, EL COMISIONISTA se obliga a no promover, intermediar ni comercializar productos o servicios directamente competidores con los de EL COMITENTE dentro del territorio asignado, garantizando lealtad comercial.',
      },
    ],
    templateHandlebars: `CONTRATO DE COMISIÓN MERCANTIL

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{comitente_nombre}}, con RFC {{comitente_rfc}}, representada por {{comitente_rep}} (en lo sucesivo, "EL COMITENTE"), y por la otra parte {{comisionista_nombre}}, con RFC {{comisionista_rfc}}, representada por {{comisionista_rep}} (en lo sucesivo, "EL COMISIONISTA"), al tenor de las siguientes:

DECLARACIONES

I. Declara EL COMITENTE ser una sociedad legalmente constituida conforme a las leyes mexicanas, con domicilio en {{comitente_domicilio}}, requiriendo los servicios de un comisionista mercantil independiente.
II. Declara EL COMISIONISTA contar con experiencia, infraestructura y autonomía técnica para desempeñar la comisión mercantil encomendada sin subordinación laboral.
III. Declaran ambas Partes que celebran el presente contrato conforme a los artículos 75, 77, 273, 274, 276, 279 y demás aplicables del Código de Comercio, reconociendo expresamente que no existe relación laboral alguna.

CLÁUSULAS

PRIMERA.- OBJETO. EL COMITENTE encomienda a EL COMISIONISTA la realización de los siguientes actos de comercio: {{objeto_comision}}.

SEGUNDA.- TERRITORIO. La comisión se desempeñará exclusivamente en: {{territorio}}.

TERCERA.- COMISIÓN Y PAGO. EL COMISIONISTA tendrá derecho a una comisión del {{porcentaje_comision}}% calculada sobre: {{base_calculo}}. Las comisiones devengadas serán liquidadas dentro de los {{dias_pago_comision}} días naturales siguientes al cobro efectivo de la operación, mediante transferencia a: {{cuenta_clabe_comisionista}}.

CUARTA.- RENDICIÓN DE CUENTAS. EL COMISIONISTA rendirá un informe por escrito dentro de los primeros {{dias_rendicion_cuentas}} días naturales de cada mes, acompañando la relación pormenorizada de operaciones y pedidos tramitados.{{#if toggle_exclusividad_territorial}}{{toggle_exclusividad_territorial}}{{/if}}

QUINTA.- NO SUBORDINACIÓN LABORAL. Las Partes reconocen que la relación es estrictamente mercantil. EL COMISIONISTA no está sujeto a horario, jornada ni subordinación jerárquica, asumiendo por su cuenta el cumplimiento de sus obligaciones fiscales y de seguridad social.

SEXTA.- VIGENCIA. El presente contrato tendrá una vigencia de {{vigencia_meses}} meses contados a partir de su firma, pudiendo terminarse anticipadamente por cualquiera de las Partes mediante aviso por escrito con 30 días de anticipación.

SÉPTIMA.- JURISDICCIÓN. Para la interpretación y cumplimiento de este contrato, las Partes se someten a los tribunales de {{ciudad_firma}}, renunciando a cualquier fuero por razón de su domicilio.

POR EL COMITENTE:
{{comitente_nombre}}
Por: {{comitente_rep}}
Firma: ________________________________________

POR EL COMISIONISTA:
{{comisionista_nombre}}
Por: {{comisionista_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'mercantil-distribucion',
    title: 'Contrato de Distribución Comercial',
    description: 'Contrato de distribución de productos y mercancías con territorio asignado, pedidos, precios, inventarios, soporte y protección de marcas.',
    module: 'mercantil',
    intentGroup: 'Distribuir / Comercializar',
    outputLabel: 'Distribución Comercial',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Guadalajara, Jalisco', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'proveedor_nombre', label: 'Nombre o Razón Social del Fabricante / Proveedor', placeholder: 'Tecnologías y Fabricaciones de México, S.A. de C.V.', type: 'text', required: true },
      { id: 'proveedor_rfc', label: 'RFC del Proveedor', placeholder: 'TFM150314ABC', type: 'text', required: true },
      { id: 'proveedor_domicilio', label: 'Domicilio del Proveedor', placeholder: 'Av. Américas 1500, Piso 12, Guadalajara, Jal.', type: 'text', required: true },
      { id: 'proveedor_rep', label: 'Representante del Proveedor', placeholder: 'Lic. Roberto Valdés Lozano', type: 'text', required: true },
      { id: 'distribuidor_nombre', label: 'Nombre o Razón Social del Distribuidor', placeholder: 'Comercializadora y Redes de Distribución del Bajío, S.A. de C.V.', type: 'text', required: true },
      { id: 'distribuidor_rfc', label: 'RFC del Distribuidor', placeholder: 'CRD180722XYZ', type: 'text', required: true },
      { id: 'distribuidor_domicilio', label: 'Domicilio del Distribuidor', placeholder: 'Blvd. Adolfo López Mateos 2300, León, Guanajuato', type: 'text', required: true },
      { id: 'distribuidor_rep', label: 'Representante del Distribuidor', placeholder: 'Ing. Gabriel Mendoza Soto', type: 'text', required: true },
      { id: 'descripcion_productos', label: 'Descripción Detallada de los Productos', placeholder: 'Equipos electrónicos de medición, sensores industriales y accesorios de control de calidad', type: 'textarea', required: true },
      { id: 'marcas_modelos', label: 'Marcas y Signos Distintivos Autorizados', placeholder: 'Marca SensorTech® y marcas derivadas', type: 'text', required: true },
      { id: 'territorio', label: 'Territorio de Distribución Asignado', placeholder: 'Estados de Guanajuato, Querétaro, Aguascalientes y San Luis Potosí', type: 'text', required: true },
      { id: 'plazo_entrega_dias', label: 'Plazo de Entrega tras Aceptación de Pedido (Días Hábiles)', placeholder: '7', type: 'number', defaultValue: '7', required: true },
      { id: 'dias_credito_pago', label: 'Plazo de Pago de Facturas (Días Naturales)', placeholder: '30', type: 'number', defaultValue: '30', required: true },
      { id: 'tasa_moratoria_mensual', label: 'Tasa de Interés Moratorio Mensual (%)', placeholder: '2.5', type: 'number', defaultValue: '2.5', required: true },
      { id: 'dias_reclamo_garantia', label: 'Plazo para Reclamos de Garantía (Días Naturales)', placeholder: '15', type: 'number', defaultValue: '15', required: true },
      { id: 'vigencia_anios', label: 'Vigencia del Contrato (Años)', placeholder: '2', type: 'number', defaultValue: '2', required: true },
    ],
    toggles: [
      {
        id: 'exclusividad_territorial_dist',
        label: 'Exclusividad Territorial para el Distribuidor',
        description: 'Impide al proveedor designar otros distribuidores en el territorio durante la vigencia.',
        defaultActive: true,
        content: '\nCLÁUSULA ESPECIAL.- EXCLUSIVIDAD TERRITORIAL. EL PROVEEDOR otorga a EL DISTRIBUIDOR el carácter de distribuidor EXCLUSIVO en el territorio asignado, comprometiéndose a no designar a otros distribuidores ni vender de forma directa dentro de dicho territorio durante la vigencia del contrato.',
      },
    ],
    templateHandlebars: `CONTRATO DE DISTRIBUCIÓN COMERCIAL

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{proveedor_nombre}}, con RFC {{proveedor_rfc}}, representada por {{proveedor_rep}} (en lo sucesivo, "EL PROVEEDOR"), y por la otra parte {{distribuidor_nombre}}, con RFC {{distribuidor_rfc}}, representada por {{distribuidor_rep}} (en lo sucesivo, "EL DISTRIBUIDOR"), al tenor de las siguientes:

DECLARACIONES

I. Declara EL PROVEEDOR ser fabricante y legítimo titular de los derechos de comercialización de los productos identificados con las marcas {{marcas_modelos}}.
II. Declara EL DISTRIBUIDOR contar con la infraestructura logística, capacidad técnica y comercial para la adecuada distribución de los productos en el territorio designado.
III. Declaran ambas Partes que celebran el contrato conforme a los artículos 75, 77 y 78 del Código de Comercio, sin que exista relación laboral ni asociación societaria entre ellas.

CLÁUSULAS

PRIMERA.- OBJETO Y PRODUCTOS. EL PROVEEDOR otorga a EL DISTRIBUIDOR el derecho de adquirir, comercializar y distribuir en el territorio pactado los siguientes productos: {{descripcion_productos}}, bajo las marcas {{marcas_modelos}}.

SEGUNDA.- TERRITORIO. El territorio asignado comprende: {{territorio}}. EL DISTRIBUIDOR se obliga a no comercializar los productos fuera del territorio sin autorización previa.{{#if toggle_exclusividad_territorial_dist}}{{toggle_exclusividad_territorial_dist}}{{/if}}

TERCERA.- PEDIDOS Y ENTREGA. Los pedidos se realizarán por escrito y se surtirán dentro de los {{plazo_entrega_dias}} días hábiles siguientes a su confirmación, entregándose en las bodegas de EL DISTRIBUIDOR.

CUARTA.- PRECIOS Y CONDICIONES DE PAGO. Los precios serán los vigentes en la lista de precios oficial. EL DISTRIBUIDOR liquidará las facturas dentro de los {{dias_credito_pago}} días naturales posteriores a su recepción. Los saldos vencidos causarán interés moratorio del {{tasa_moratoria_mensual}}% mensual.

QUINTA.- GARANTÍA Y RECLAMOS. Los reclamos por defectos de fabricación deberán formularse por escrito dentro de los {{dias_reclamo_garantia}} días naturales siguientes a la recepción de las mercancías.

SEXTA.- NO SUBORDINACIÓN LABORAL. Las Partes son completamente independientes. Cada una responderá de sus propios empleados y obligaciones fiscales y patronales.

SÉPTIMA.- VIGENCIA. El presente contrato tendrá una vigencia de {{vigencia_anios}} años contados a partir de su firma.

OCTAVA.- JURISDICCIÓN. Para la interpretación y resolución de controversias, las Partes se someten a los tribunales competentes de {{ciudad_firma}}.

POR EL PROVEEDOR:
{{proveedor_nombre}}
Por: {{proveedor_rep}}
Firma: ________________________________________

POR EL DISTRIBUIDOR:
{{distribuidor_nombre}}
Por: {{distribuidor_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'mercantil-cesion-derechos',
    title: 'Cesión de Derechos Patrimoniales y Propiedad Intelectual',
    description: 'Cesión definitiva y onerosa de código de software, marcas IMPI, diseños o derechos de autor con saneamiento y renuncia de titularidad.',
    module: 'mercantil',
    intentGroup: 'Proteger / Transferir',
    outputLabel: 'Cesión de Derechos / PI',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'cedente_nombre', label: 'Nombre o Razón Social del Cedente (Autor / Titular)', placeholder: 'Ing. Carlos Alberto Morales Nava', type: 'text', required: true },
      { id: 'cedente_rfc', label: 'RFC del Cedente', placeholder: 'MONC880615ABC', type: 'text', required: true },
      { id: 'cedente_domicilio', label: 'Domicilio del Cedente', placeholder: 'Calle Durango 210, Roma Norte, Cuauhtémoc, CDMX', type: 'text', required: true },
      { id: 'cedente_rep', label: 'Representante del Cedente (Si es Persona Moral)', placeholder: 'Por su propio derecho', type: 'text', defaultValue: 'Por su propio derecho' },
      { id: 'cesionario_nombre', label: 'Nombre o Razón Social del Cesionario (Empresa Receptora)', placeholder: 'Desarrollos Digitales Innovadores, S.A. de C.V.', type: 'text', required: true },
      { id: 'cesionario_rfc', label: 'RFC del Cesionario', placeholder: 'DDI190212XYZ', type: 'text', required: true },
      { id: 'cesionario_domicilio', label: 'Domicilio del Cesionario', placeholder: 'Av. Insurgentes Sur 1450, Piso 5, Benito Juárez, CDMX', type: 'text', required: true },
      { id: 'cesionario_rep', label: 'Representante Legal del Cesionario', placeholder: 'Lic. Laura Patricia Garza Vega', type: 'text', required: true },
      { id: 'descripcion_software', label: 'Descripción del Software / Código / Desarrollos', placeholder: 'Código fuente, módulos backend en Node.js, arquitectura de bases de datos PostgreSQL y frontend React de la plataforma fintech v2.0', type: 'textarea', required: true },
      { id: 'registro_marca_impi', label: 'Marcas y Registros IMPI (Si Aplica)', placeholder: 'Marca registrada "FinTech Cloud" Reg. No. 2345678 Clase 42', type: 'text' },
      { id: 'registro_diseno_indautor', label: 'Registro INDAUTOR / Obras (Si Aplica)', placeholder: 'Certificado de Registro Público del Derecho de Autor No. 03-2026-12345678', type: 'text' },
      { id: 'monto_cesion', label: 'Monto de la Contraprestación ($ MXN / USD)', placeholder: '350,000.00 MXN', type: 'currency', required: true },
      { id: 'monto_letra', label: 'Monto en Letra', placeholder: 'Trescientos cincuenta mil pesos 00/100 M.N.', type: 'text', required: true },
      { id: 'fecha_pago', label: 'Fecha Límite de Pago', type: 'date', required: true },
      { id: 'forma_pago', label: 'Forma de Pago', placeholder: 'Transferencia electrónica bancaria SPEI en una sola exhibición', type: 'text', defaultValue: 'Transferencia electrónica SPEI', required: true },
      { id: 'pena_convencional', label: 'Pena Convencional por Incumplimiento ($ MXN / USD)', placeholder: '500,000.00 MXN', type: 'text', defaultValue: '$500,000.00 M.N.' },
    ],
    templateHandlebars: `CONTRATO DE CESIÓN DE DERECHOS PATRIMONIALES Y DE PROPIEDAD INTELECTUAL

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{cedente_nombre}}, con RFC {{cedente_rfc}}, con domicilio en {{cedente_domicilio}} (en lo sucesivo, "EL CEDENTE"), y por la otra parte {{cesionario_nombre}}, con RFC {{cesionario_rfc}}, representada por {{cesionario_rep}} (en lo sucesivo, "EL CESIONARIO"), conforme a las siguientes:

DECLARACIONES

I. Declara EL CEDENTE ser el legítimo creador y titular exclusivo de los derechos patrimoniales sobre los bienes intelectuales objeto de este contrato, encontrándose libres de todo gravamen o limitación.
II. Declara EL CESIONARIO tener interés y capacidad jurídica y económica para adquirir la titularidad definitiva de los derechos patrimoniales descritos.
III. Declaran ambas Partes celebrar la presente cesión conforme a la Ley Federal del Derecho de Autor, Ley Federal de Protección a la Propiedad Industrial y el Código Civil Federal.

CLÁUSULAS

PRIMERA.- OBJETO DE LA CESIÓN. EL CEDENTE cede de manera onerosa, total y definitiva a favor de EL CESIONARIO la totalidad de los derechos patrimoniales sobre los siguientes activos:
- Software, código fuente y desarrollos: {{descripcion_software}}
{{#if registro_marca_impi}}- Signos distintivos y marcas: {{registro_marca_impi}}{{/if}}
{{#if registro_diseno_indautor}}- Registros INDAUTOR / Obras: {{registro_diseno_indautor}}{{/if}}

La cesión comprende todas las facultades de reproducción, distribución, transformación, comercialización, licenciamiento y explotación sin límite geográfico ni temporal.

SEGUNDA.- CONTRAPRESTACIÓN. EL CESIONARIO pagará a EL CEDENTE la cantidad de $ {{monto_cesion}} ({{monto_letra}}), más impuestos aplicables, a liquidarse a más tardar el {{fecha_pago}} mediante {{forma_pago}}.

TERCERA.- DERECHOS MORALES Y SANEAMIENTO. Los derechos morales corresponden inalienablemente al autor conforme a la ley. EL CEDENTE garantiza la legítima titularidad de los derechos cedidos y se obliga al saneamiento para el caso de evicción, respondiendo de cualquier reclamación de terceros.

CUARTA.- FORMALIZACIÓN Y REGISTROS. EL CESIONARIO queda facultado para inscribir la presente cesión ante el INDAUTOR, el IMPI y demás registros públicos correspondientes.

QUINTA.- PENA CONVENCIONAL. En caso de incumplimiento de las obligaciones pactadas, la parte infractora pagará a la otra una pena convencional de {{pena_convencional}}, sin perjuicio de las acciones legales por daños y perjuicios.

SEXTA.- JURISDICCIÓN. Para la interpretación y cumplimiento de este instrumento, las Partes se someten a los tribunales de {{ciudad_firma}}, renunciando a cualquier otro fuero.

POR EL CEDENTE:
{{cedente_nombre}}
Firma: ________________________________________

POR EL CESIONARIO:
{{cesionario_nombre}}
Por: {{cesionario_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'mercantil-reconocimiento-adeudo',
    title: 'Convenio de Reconocimiento de Adeudo y Plan de Pagos',
    description: 'Reconocimiento formal de saldo líquido, calendario de parcialidades, intereses moratorios, vencimiento anticipado y sumisión a juicio ejecutivo.',
    module: 'mercantil',
    intentGroup: 'Cobrar / Reestructurar',
    outputLabel: 'Reconocimiento de Adeudo',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'acreedor_nombre', label: 'Nombre o Razón Social del Acreedor', placeholder: 'Financiera y Arrendadora Capital, S.A. de C.V.', type: 'text', required: true },
      { id: 'acreedor_rfc', label: 'RFC del Acreedor', placeholder: 'FAC140920ABC', type: 'text', required: true },
      { id: 'acreedor_domicilio', label: 'Domicilio del Acreedor', placeholder: 'Av. Paseo de la Reforma 400, Piso 15, Cuauhtémoc, CDMX', type: 'text', required: true },
      { id: 'acreedor_rep', label: 'Representante Legal del Acreedor', placeholder: 'Lic. Guillermo Obregón Pineda', type: 'text', required: true },
      { id: 'deudor_nombre', label: 'Nombre o Razón Social del Deudor', placeholder: 'Constructora y Edificaciones del Centro, S.A. de C.V.', type: 'text', required: true },
      { id: 'deudor_rfc', label: 'RFC del Deudor', placeholder: 'CEC170315XYZ', type: 'text', required: true },
      { id: 'deudor_domicilio', label: 'Domicilio del Deudor', placeholder: 'Calle Benito Juárez 88, Col. San Ángel, Álvaro Obregón, CDMX', type: 'text', required: true },
      { id: 'deudor_rep', label: 'Representante Legal del Deudor', placeholder: 'Ing. Eduardo Salgado Bravo', type: 'text', required: true },
      { id: 'monto_adeudo', label: 'Monto Total Líquido Reconocido ($ MXN / USD)', placeholder: '1,200,000.00 MXN', type: 'currency', required: true },
      { id: 'monto_letra', label: 'Monto en Letra', placeholder: 'Un millón doscientos mil pesos 00/100 M.N.', type: 'text', required: true },
      { id: 'origen_deuda', label: 'Origen y Concepto de la Deuda', placeholder: 'Facturas vencidas correspondientes al suministro de materiales de construcción durante el ejercicio 2025', type: 'textarea', required: true },
      { id: 'calendario_pagos', label: 'Calendario de Parcialidades y Fechas Límites', placeholder: '4 parcialidades iguales de $300,000.00 M.N. pagaderas los días 15 de cada mes a partir del 15 de septiembre de 2026', type: 'textarea', required: true },
      { id: 'cuenta_clabe_pago', label: 'Banco y Cuenta / CLABE para Depósitos', placeholder: 'Citibanamex · CLABE: 002180012345678901 a nombre del Acreedor', type: 'text', required: true },
      { id: 'tasa_moratoria_mensual', label: 'Tasa de Interés Moratorio Mensual (%)', placeholder: '3.0', type: 'number', defaultValue: '3.0', required: true },
      { id: 'parcialidades_incumplimiento', label: 'Número de Parcialidades en Mora para Vencimiento Anticipado', placeholder: '1', type: 'number', defaultValue: '1', required: true },
    ],
    templateHandlebars: `CONVENIO DE RECONOCIMIENTO DE ADEUDO Y PLAN DE PAGOS

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{acreedor_nombre}}, con RFC {{acreedor_rfc}}, representada por {{acreedor_rep}} (en lo sucesivo, "EL ACREEDOR"), y por la otra parte {{deudor_nombre}}, con RFC {{deudor_rfc}}, representada por {{deudor_rep}} (en lo sucesivo, "EL DEUDOR"), al tenor de las siguientes:

DECLARACIONES

I. Declara EL ACREEDOR ser titular legítimo del crédito y adeudo que se formaliza en el presente instrumento.
II. Declara EL DEUDOR reconocer de manera expresa, libre e incondicional la existencia del adeudo cierto, líquido y exigible a su cargo.
III. Declaran ambas Partes que celebran este convenio conforme a los artículos 1792, 1793 y 1796 del Código Civil Federal y Código de Comercio, sin que implique novación de las obligaciones de origen.

CLÁUSULAS

PRIMERA.- RECONOCIMIENTO DE ADEUDO. EL DEUDOR reconoce expresamente adeudar a favor de EL ACREEDOR la cantidad líquida de $ {{monto_adeudo}} ({{monto_letra}}), originada por: {{origen_deuda}}.

SEGUNDA.- PLAN DE PAGOS Y AMORTIZACIÓN. EL DEUDOR se obliga a liquidar la totalidad del saldo en las siguientes parcialidades:
{{calendario_pagos}}

Los pagos se efectuarán mediante transferencia a: {{cuenta_clabe_pago}}.

TERCERA.- INTERESES MORATORIOS. En caso de mora en cualquiera de los pagos pactados, el saldo insoluto causará intereses moratorios a razón del {{tasa_moratoria_mensual}}% mensual hasta la total liquidación.

CUARTA.- VENCIMIENTO ANTICIPADO Y EJECUCIÓN. El incumplimiento o retraso en {{parcialidades_incumplimiento}} parcialidad(es) facultará a EL ACREEDOR a dar por vencido anticipadamente el saldo total insoluto y a exigir de inmediato la totalidad del principal, intereses moratorios y gastos de cobranza en la vía ejecutiva mercantil correspondiente.

QUINTA.- JURISDICCIÓN. Para la interpretación, cumplimiento y ejecución judicial del presente convenio, las Partes se someten a los tribunales de {{ciudad_firma}}, renunciando a cualquier fuero distinto.

POR EL ACREEDOR:
{{acreedor_nombre}}
Por: {{acreedor_rep}}
Firma: ________________________________________

POR EL DEUDOR:
{{deudor_nombre}}
Por: {{deudor_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'mercantil-convenio-modificatorio',
    title: 'Convenio Modificatorio / Adenda Contractual',
    description: 'Formato universal de adenda para prorrogar plazos de entrega, cambiar montos de contraprestación o ajustar especificaciones de cualquier contrato vigente.',
    module: 'mercantil',
    intentGroup: 'Modificar / Prorrogar',
    outputLabel: 'Convenio Modificatorio',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma de la Adenda', type: 'date', required: true },
      { id: 'contrato_original_tipo', label: 'Tipo / Nombre del Contrato Original', placeholder: 'Contrato de Prestación de Servicios de Consultoría Tecnológica', type: 'text', required: true },
      { id: 'contrato_original_fecha', label: 'Fecha de Celebración del Contrato Original', type: 'date', required: true },
      { id: 'parte_1_nombre', label: 'Nombre o Razón Social de la Parte 1', placeholder: 'Corporativo Empresarial Azteca, S.A. de C.V.', type: 'text', required: true },
      { id: 'parte_1_rep', label: 'Representante de la Parte 1', placeholder: 'Lic. Ignacio Cárdenas Soto', type: 'text', required: true },
      { id: 'parte_2_nombre', label: 'Nombre o Razón Social de la Parte 2', placeholder: 'Servicios Digitales del Norte, S.A. de C.V.', type: 'text', required: true },
      { id: 'parte_2_rep', label: 'Representante de la Parte 2', placeholder: 'Ing. Patricia Domínguez Lara', type: 'text', required: true },
      { id: 'modificacion_plazos', label: 'Modificación a Plazos y Vigencia', placeholder: 'Se prorroga el plazo de entrega y vigencia del contrato por 6 meses adicionales, concluyendo el 31 de marzo de 2027', type: 'textarea', required: true },
      { id: 'modificacion_montos', label: 'Modificación a Montos / Contraprestaciones (Opcional)', placeholder: 'Se incrementa la contraprestación mensual en $25,000.00 M.N., quedando un total mensual de $125,000.00 M.N. más IVA', type: 'textarea' },
      { id: 'modificacion_entregables', label: 'Modificación a Entregables o Alcance (Opcional)', placeholder: 'Se adiciona el módulo de facturación electrónica 4.0 con timbrado ilimitado', type: 'textarea' },
    ],
    templateHandlebars: `CONVENIO MODIFICATORIO Y ADENDA CONTRACTUAL

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{parte_1_nombre}}, representada por {{parte_1_rep}} ("LA PARTE 1"), y por la otra {{parte_2_nombre}}, representada por {{parte_2_rep}} ("LA PARTE 2"), al tenor de las siguientes:

DECLARACIONES

I. Declaran las Partes que con fecha {{contrato_original_fecha}} celebraron un {{contrato_original_tipo}}, el cual se encuentra actualmente vigente y surtiendo plenos efectos legales.
II. Declaran que es su voluntad modificar parcialmente los términos del contrato original, ratificando la plena vigencia de todas aquellas cláusulas que no sean expresamente reformadas en este instrumento.

CLÁUSULAS

PRIMERA.- OBJETO DE LA MODIFICACIÓN. Las Partes acuerdan modificar el contrato original en los siguientes aspectos:
- Plazos y vigencia: {{modificacion_plazos}}
{{#if modificacion_montos}}- Montos y contraprestación: {{modificacion_montos}}{{/if}}
{{#if modificacion_entregables}}- Entregables y alcance: {{modificacion_entregables}}{{/if}}

SEGUNDA.- SUBSISTENCIA DEL CONTRATO ORIGINAL. Las Partes ratifican en todos sus términos el contrato original en todo aquello que no haya sido expresamente modificado por el presente instrumento. Las garantías, penas convencionales y acuerdos de confidencialidad continuarán vigentes.

TERCERA.- JURISDICCIÓN. Para la interpretación y cumplimiento del presente convenio y del contrato modificado, las Partes se someten a los tribunales competentes de {{ciudad_firma}}.

POR LA PARTE 1:
{{parte_1_nombre}}
Por: {{parte_1_rep}}
Firma: ________________________________________

POR LA PARTE 2:
{{parte_2_nombre}}
Por: {{parte_2_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'mercantil-nda-bilateral',
    title: 'Convenio de Confidencialidad Bilateral (NDA)',
    description: 'Protección integral de secretos industriales, datos financieros, técnicos y de negocio con penas convencionales.',
    module: 'mercantil',
    intentGroup: 'Proteger Información',
    outputLabel: 'Convenio de Confidencialidad',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'parte_a_nombre', label: 'Parte Reveladora / Parte A', placeholder: 'Tecnologías y Servicios Digitales, S.A. de C.V.', type: 'text', required: true },
      { id: 'parte_a_rep', label: 'Representante Legal Parte A', placeholder: 'Lic. Roberto Morales Ruiz', type: 'text', required: true },
      { id: 'parte_a_domicilio', label: 'Domicilio Parte A', placeholder: 'Av. Insurgentes Sur 1200, Benito Juárez, CDMX', type: 'text', required: true },
      { id: 'parte_b_nombre', label: 'Parte Receptora / Parte B', placeholder: 'Consultoría e Inversiones Capital, S.A. de C.V.', type: 'text', required: true },
      { id: 'parte_b_rep', label: 'Representante Legal Parte B', placeholder: 'Ing. Alejandro Silva Garza', type: 'text', required: true },
      { id: 'parte_b_domicilio', label: 'Domicilio Parte B', placeholder: 'Blvd. Manuel Ávila Camacho 40, Lomas de Chapultepec, CDMX', type: 'text', required: true },
      { id: 'proposito', label: 'Propósito del Intercambio de Información', placeholder: 'La evaluación de una potencial alianza comercial y coinversión tecnológica', type: 'textarea', required: true },
      { id: 'vigencia_anios', label: 'Vigencia de Protección (Años)', placeholder: '3', type: 'number', defaultValue: '3', required: true },
      { id: 'pena_convencional', label: 'Pena Convencional ($ MXN / USD)', placeholder: '1,000,000.00 MXN', type: 'text', defaultValue: '$1,000,000.00 M.N.' },
    ],
    toggles: [
      {
        id: 'no_solicitacion',
        label: 'Cláusula de No Solicitación de Empleados',
        description: 'Prohíbe a las partes contratar al personal clave de la otra durante la vigencia.',
        defaultActive: true,
        content: '\nCLÁUSULA ESPECIAL.- NO SOLICITACIÓN DE PERSONAL. Las Partes convienen que durante la vigencia del presente Convenio y por un plazo adicional de 1 (un) año posterior a su terminación, ninguna de ellas contratará ni intentará reclutar o contratar a directivos, empleados clave o consultores de la otra Parte sin consentimiento previo y por escrito.',
      },
    ],
    templateHandlebars: `CONVENIO BILATERAL DE CONFIDENCIALIDAD Y NO DIVULGACIÓN DE INFORMACIÓN

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{parte_a_nombre}}, representada por {{parte_a_rep}} ("PARTE A"), y por la otra parte {{parte_b_nombre}}, representada por {{parte_b_rep}} ("PARTE B"), conforme a las siguientes:

DECLARACIONES

I. Declara la PARTE A que es una sociedad debidamente constituida conforme a las leyes de los Estados Unidos Mexicanos, con domicilio fiscal en {{parte_a_domicilio}}.
II. Declara la PARTE B que es una sociedad debidamente constituida conforme a las leyes de los Estados Unidos Mexicanos, con domicilio fiscal en {{parte_b_domicilio}}.
III. Declaran ambas partes que tienen interés en evaluar: {{proposito}} (en adelante, el "PROPÓSITO").

CLÁUSULAS

PRIMERA.- DEFINICIÓN DE INFORMACIÓN CONFIDENCIAL. Para efectos del presente Convenio, tendrá carácter de Información Confidencial toda información técnica, financiera, comercial, operativa, jurídica, bases de datos, software, secretos industriales, planes de negocio y know-how que las Partes se transmitan por cualquier medio.

SEGUNDA.- OBLIGACIONES DE NO DIVULGACIÓN. La Parte Receptora se obliga a:
a) Mantener la Información Confidencial en estricta reserva y no divulgarla a terceros sin consentimiento previo y por escrito.
b) Usar la Información Confidencial exclusivamente para el cumplimiento del PROPÓSITO.
c) Limitar el acceso únicamente a aquellos empleados o asesores que requieran conocerla.

TERCERA.- VIGENCIA. Las obligaciones de confidencialidad subsistirán durante las conversaciones entre las Partes y por un período de {{vigencia_anios}} años contados a partir de la fecha de firma del presente instrumento.

CUARTA.- PENA CONVENCIONAL. En caso de incumplimiento comprobado a las obligaciones de confidencialidad, la Parte infractora pagará a la Parte afectada una pena convencional por la cantidad de {{pena_convencional}}, sin perjuicio de las acciones por daños y perjuicios y las responsabilidades en términos de la Ley Federal de Protección a la Propiedad Industrial.{{#if toggle_no_solicitacion}}{{toggle_no_solicitacion}}{{/if}}

QUINTA.- JURISDICCIÓN Y LEY APLICABLE. Para la interpretación y cumplimiento del presente Convenio, las Partes se someten expresamente a las leyes federales de los Estados Unidos Mexicanos y a los tribunales de {{ciudad_firma}}.

POR LA PARTE A:
{{parte_a_nombre}}
Por: {{parte_a_rep}}
Firma: ________________________________________

POR LA PARTE B:
{{parte_b_nombre}}
Por: {{parte_b_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'mercantil-asamblea-ordinaria',
    title: 'Acta de Asamblea General Ordinaria de Accionistas',
    description: 'Acta formal para aprobación de estados financieros, informe de administración, ratificación de comisario y poderes.',
    module: 'mercantil',
    intentGroup: 'Gobernar Sociedad',
    outputLabel: 'Acta de Asamblea Ordinaria',
    fields: [
      { id: 'denominacion_social', label: 'Denominación Social de la Empresa', placeholder: 'Grupo Comercial del Norte, S.A. de C.V.', type: 'text', required: true },
      { id: 'fecha_asamblea', label: 'Fecha de la Asamblea', type: 'date', required: true },
      { id: 'hora_asamblea', label: 'Hora de Inicio', placeholder: '10:00 horas', type: 'text', defaultValue: '10:00 horas', required: true },
      { id: 'domicilio_social', label: 'Lugar de Celebración (Domicilio Social)', placeholder: 'Av. Constitución 400, Monterrey, N.L.', type: 'text', required: true },
      { id: 'ejercicio_social', label: 'Ejercicio Fiscal / Social que se Aprueba', placeholder: '2025', type: 'text', defaultValue: '2025', required: true },
      { id: 'presidente_asamblea', label: 'Presidente de la Asamblea', placeholder: 'Lic. Fernando Garza Sada', type: 'text', required: true },
      { id: 'secretario_asamblea', label: 'Secretario de la Asamblea', placeholder: 'Lic. Claudia Treviño Santos', type: 'text', required: true },
      { id: 'comisario_asamblea', label: 'Comisario de la Sociedad', placeholder: 'C.P. Jorge Elizondo Flores', type: 'text', required: true },
      { id: 'porcentaje_capital', label: 'Porcentaje del Capital Social Representado (%)', placeholder: '100%', type: 'text', defaultValue: '100%', required: true },
    ],
    templateHandlebars: `ACTA DE ASAMBLEA GENERAL ORDINARIA DE ACCIONISTAS DE {{denominacion_social}}

En el domicilio social de la empresa ubicado en {{domicilio_social}}, siendo las {{hora_asamblea}} del día {{fecha_asamblea}}, se reunieron los accionistas de {{denominacion_social}} (la "Sociedad").

PRESIDENCIA Y SECRETARÍA:
Presidió la asamblea {{presidente_asamblea}} y fungió como Secretario {{secretario_asamblea}}, con la asistencia del Comisario de la Sociedad, {{comisario_asamblea}}.

LISTA DE ASISTENCIA Y QUÓRUM:
El Secretario formuló la lista de asistencia y certificó que se encuentra representado el {{porcentaje_capital}} de las acciones con derecho a voto que integran el capital social, declarándose legalmente instalada la asamblea.

ORDEN DEL DÍA:
I. Presentación, discusión y, en su caso, aprobación del informe del Administrador respecto al ejercicio social correspondiente a {{ejercicio_social}}.
II. Presentación del dictamen del Comisario respecto al ejercicio social {{ejercicio_social}}.
III. Aprobación de los Estados Financieros del ejercicio {{ejercicio_social}} y resolución sobre la aplicación de resultados.
IV. Ratificación de nombramientos de los órganos de administración y comisario.
V. Designación de delegados especiales para la protocolización del acta.

RESOLUCIONES:

PRIMERA.- Se aprueba por unanimidad de votos el informe rendido por el órgano de administración de la Sociedad correspondiente al ejercicio {{ejercicio_social}}.
SEGUNDA.- Se aprueba en sus términos el dictamen presentado por el Comisario respecto al ejercicio {{ejercicio_social}}.
TERCERA.- Se aprueban en todos sus términos los Estados Financieros de la Sociedad correspondientes al ejercicio cerrado al 31 de diciembre de {{ejercicio_social}}, acordándose aplicar los resultados a la cuenta de utilidades acumuladas.
CUARTA.- Se ratifica en sus cargos a los miembros del Consejo de Administración / Administrador Único y al Comisario {{comisario_asamblea}}, con todas las facultades conferidas en los estatutos sociales.
QUINTA.- Se designa como Delegado Especial al Secretario de la Asamblea para que acuda ante el Notario Público de su elección a protocolizar el contenido de la presente acta.

No habiendo más asuntos que tratar, se levantó la sesión siendo las 11:30 horas, firmando los comparecientes para debida constancia.

PRESIDENTE DE LA ASAMBLEA:
{{presidente_asamblea}}
Firma: ________________________________________

SECRETARIO DE LA ASAMBLEA:
{{secretario_asamblea}}
Firma: ________________________________________

COMISARIO:
{{comisario_asamblea}}
Firma: ________________________________________
`,
  },
  {
    id: 'mercantil-suministro',
    title: 'Contrato de Suministro Mercantil de Bienes',
    description: 'Regulación de entregas periódicas de mercancías, precios, órdenes de compra, penalizaciones por demora y exclusividad.',
    module: 'mercantil',
    intentGroup: 'Contratar / Operar',
    outputLabel: 'Contrato de Suministro',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Guadalajara, Jalisco', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'proveedor_nombre', label: 'Razón Social del Proveedor', placeholder: 'Insumos Industriales de Occidente, S.A. de C.V.', type: 'text', required: true },
      { id: 'proveedor_rep', label: 'Representante del Proveedor', placeholder: 'Lic. Javier Orozco Navarro', type: 'text', required: true },
      { id: 'cliente_nombre', label: 'Razón Social del Cliente', placeholder: 'Manufacturas del Bajío, S.A. de C.V.', type: 'text', required: true },
      { id: 'cliente_rep', label: 'Representante del Cliente', placeholder: 'Ing. Laura Valenzuela Pérez', type: 'text', required: true },
      { id: 'descripcion_bienes', label: 'Descripción de los Bienes o Insumos', placeholder: 'Empaques de cartón corrugado y material de embalaje industrial', type: 'textarea', required: true },
      { id: 'plazo_entrega_dias', label: 'Plazo de Entrega tras Orden de Compra (Días hábiles)', placeholder: '5', type: 'number', defaultValue: '5', required: true },
      { id: 'plazo_pago_dias', label: 'Plazo de Pago de Facturas (Días naturales)', placeholder: '30', type: 'number', defaultValue: '30', required: true },
      { id: 'pena_moratoria_diaria', label: 'Penalización Diaria por Retraso en Entrega (%)', placeholder: '1.0', type: 'number', defaultValue: '1.0', required: true },
    ],
    templateHandlebars: `CONTRATO DE SUMINISTRO MERCANTIL

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{proveedor_nombre}}, representada por {{proveedor_rep}} ("PROVEEDOR"), y por la otra {{cliente_nombre}}, representada por {{cliente_rep}} ("CLIENTE"), al tenor de las siguientes:

DECLARACIONES

I. Declara el PROVEEDOR que cuenta con la capacidad técnica, financiera y operativa para suministrar: {{descripcion_bienes}}.
II. Declara el CLIENTE que requiere el suministro periódico y continuo de los referidos bienes para el desarrollo de su actividad.

CLÁUSULAS

PRIMERA.- OBJETO. El PROVEEDOR se obliga a suministrar periódicamente al CLIENTE, y este se obliga a adquirir, los bienes consistentes en: {{descripcion_bienes}}, conforme a las órdenes de compra emitidas.

SEGUNDA.- ÓRDENES DE COMPRA Y ENTREGA. Las entregas se realizarán en el domicilio del CLIENTE en un plazo máximo de {{plazo_entrega_dias}} días hábiles contados a partir de la recepción de cada orden de compra.

TERCERA.- PRECIO Y FORMA DE PAGO. El CLIENTE pagará el importe de las facturas dentro de los {{plazo_pago_dias}} días naturales siguientes a la recepción y validación del CFDI.

CUARTA.- PENA POR DEMORA EN ENTREGA. Si el PROVEEDOR se retrasa en la entrega de las mercancías, se aplicará una pena del {{pena_moratoria_diaria}}% diario sobre el valor de los bienes demorados.

QUINTA.- JURISDICCIÓN. Para la resolución de cualquier controversia, las Partes se someten expresamente a los tribunales de {{ciudad_firma}}.

POR EL PROVEEDOR:
{{proveedor_nombre}}
Por: {{proveedor_rep}}
Firma: ________________________________________

POR EL CLIENTE:
{{cliente_nombre}}
Por: {{cliente_rep}}
Firma: ________________________________________
`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ── 2. LABORAL Y EMPLEO ────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'laboral-confidencialidad-empleados',
    title: 'Convenio de Confidencialidad y No Competencia Laboral',
    description: 'Anexo de protección de cartera de clientes, secretos industriales/técnicos, titularidad de invenciones y restricciones postcontractuales.',
    module: 'laboral',
    intentGroup: 'Proteger Información',
    outputLabel: 'Confidencialidad Laboral',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'empresa_nombre', label: 'Nombre o Razón Social de la Empresa', placeholder: 'Servicios de Tecnología Corporativa, S.A. de C.V.', type: 'text', required: true },
      { id: 'empresa_rfc', label: 'RFC de la Empresa', placeholder: 'STC160814ABC', type: 'text', required: true },
      { id: 'empresa_domicilio', label: 'Domicilio de la Empresa', placeholder: 'Av. Ejército Nacional 450, Polanco, CDMX', type: 'text', required: true },
      { id: 'empresa_rep', label: 'Representante Legal de la Empresa', placeholder: 'Lic. Mariana Cordero Ramos', type: 'text', required: true },
      { id: 'empleado_nombre', label: 'Nombre Completo del Empleado', placeholder: 'Ing. Rodrigo Sánchez Morales', type: 'text', required: true },
      { id: 'empleado_rfc', label: 'RFC / CURP del Empleado', placeholder: 'SAMR910420XXX', type: 'text', required: true },
      { id: 'empleado_domicilio', label: 'Domicilio del Empleado', placeholder: 'Calle Eugenia 340, Del Valle Centro, CDMX', type: 'text', required: true },
      { id: 'puesto_empleado', label: 'Puesto o Área del Empleado', placeholder: 'Director de Arquitectura de Software y Datos', type: 'text', required: true },
      { id: 'fecha_contrato_laboral', label: 'Fecha del Contrato Individual de Trabajo', type: 'date', required: true },
      { id: 'anios_confidencialidad_post', label: 'Años de Confidencialidad Post-Laboral', placeholder: '3', type: 'number', defaultValue: '3', required: true },
      { id: 'meses_proteccion_clientes', label: 'Meses de Protección de Cartera de Clientes', placeholder: '12', type: 'number', defaultValue: '12', required: true },
      { id: 'meses_no_competencia', label: 'Meses de No Competencia (Si Aplica)', placeholder: '6', type: 'number', defaultValue: '6' },
      { id: 'compensacion_no_competencia', label: 'Compensación Económica por No Competencia ($ MXN Mensual)', placeholder: '$15,000.00 M.N. mensual durante la restricción', type: 'text', defaultValue: '$10,000.00 M.N. mensuales' },
      { id: 'pena_convencional', label: 'Pena Convencional por Violación ($ MXN / USD)', placeholder: '500,000.00 MXN', type: 'text', defaultValue: '$500,000.00 M.N.' },
    ],
    toggles: [
      {
        id: 'no_competencia_postlaboral',
        label: 'Pacto de No Competencia Post-Laboral Compensado',
        description: 'Restringe prestar servicios a competidores directos pagando una compensación económica mensual.',
        defaultActive: true,
        content: '\nCLÁUSULA ESPECIAL.- NO COMPETENCIA POST-LABORAL. En virtud de la compensación económica que LA EMPRESA cubrirá por la cantidad señalada, EL EMPLEADO se obliga a no prestar servicios directos o indirectos para empresas competidoras directas en el territorio durante el plazo pactado posterior a la terminación laboral.',
      },
    ],
    templateHandlebars: `CONVENIO DE CONFIDENCIALIDAD Y NO COMPETENCIA PARA EMPLEADOS

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{empresa_nombre}}, con RFC {{empresa_rfc}}, representada por {{empresa_rep}} ("LA EMPRESA"), y por la otra parte el C. {{empleado_nombre}}, con RFC/CURP {{empleado_rfc}} ("EL EMPLEADO"), al tenor de las siguientes:

DECLARACIONES

I. Declara LA EMPRESA ser titular legítima de secretos industriales, know-how, información técnica y comercial reservada, así como de cartera de clientes.
II. Declara EL EMPLEADO laborar en el puesto de {{puesto_empleado}}, reconociendo que dicho cargo le otorga acceso a información estratégica y confidencial.
III. Declaran ambas Partes que este convenio es accesorio y complementario al Contrato Individual de Trabajo celebrado el {{fecha_contrato_laboral}}, sujetándose a los artículos 134 y 135 de la Ley Federal del Trabajo y legislación de propiedad industrial.

CLÁUSULAS

PRIMERA.- INFORMACIÓN CONFIDENCIAL. Se consideran confidenciales todos los secretos técnicos, código fuente, diseños, listas de clientes, márgenes de utilidad, estrategias de mercado y datos financieros de LA EMPRESA.

SEGUNDA.- OBLIGACIONES DE CONFIDENCIALIDAD. EL EMPLEADO se obliga a guardar estricta reserva durante la relación de trabajo y por un plazo de {{anios_confidencialidad_post}} años posteriores a su terminación, respecto de toda información no pública de LA EMPRESA.

TERCERA.- PROTECCIÓN DE CARTERA DE CLIENTES. Durante la vigencia laboral y por {{meses_proteccion_clientes}} meses posteriores a su conclusión, EL EMPLEADO no contactará ni ofrecerá servicios a clientes de LA EMPRESA para beneficio propio o de terceros.{{#if toggle_no_competencia_postlaboral}}{{toggle_no_competencia_postlaboral}}{{/if}}

CUARTA.- TITULARIDAD DE INVENCIONES Y DESARROLLOS. Toda invención, código, software o desarrollo realizado por EL EMPLEADO con recursos de LA EMPRESA pertenecerá exclusivamente a LA EMPRESA conforme a la Ley Federal del Trabajo.

QUINTA.- PENA CONVENCIONAL. El incumplimiento comprobado a las obligaciones de confidencialidad o lealtad causará una pena convencional de {{pena_convencional}}, sin perjuicio de las responsabilidades civiles y penales aplicables.

SEXTA.- JURISDICCIÓN. Para la interpretación y cumplimiento de este instrumento, las Partes se someten a los tribunales competentes de {{ciudad_firma}}.

POR LA EMPRESA:
{{empresa_nombre}}
Por: {{empresa_rep}}
Firma: ________________________________________

EL EMPLEADO:
{{empleado_nombre}}
Firma: ________________________________________
`,
  },
  {
    id: 'laboral-contrato-individual',
    title: 'Contrato Individual de Trabajo (Tiempo Indeterminado)',
    description: 'Contrato laboral estándar mexicano conforme al Art. 25 LFT con puesto, jornada, salario, prestaciones y confidencialidad.',
    module: 'laboral',
    intentGroup: 'Contratar Personal',
    outputLabel: 'Contrato Individual de Trabajo',
    fields: [
      { id: 'patron_nombre', label: 'Nombre o Razón Social del Patrón', placeholder: 'Servicios Corporativos Azteca, S.A. de C.V.', type: 'text', required: true },
      { id: 'patron_rep', label: 'Representante Legal del Patrón', placeholder: 'Lic. Miguel Ángel Ramos', type: 'text', required: true },
      { id: 'patron_domicilio', label: 'Domicilio de la Empresa / Centro de Trabajo', placeholder: 'Av. Vallarta 2440, Guadalajara, Jal.', type: 'text', required: true },
      { id: 'trabajador_nombre', label: 'Nombre Completo del Trabajador', placeholder: 'Carlos Alberto Mendoza Ortiz', type: 'text', required: true },
      { id: 'trabajador_rfc', label: 'RFC / CURP del Trabajador', placeholder: 'MEOC900814XXX / CURP...', type: 'text', required: true },
      { id: 'trabajador_domicilio', label: 'Domicilio Particular del Trabajador', placeholder: 'Calle Hidalgo 120, Col. Zapopan Centro', type: 'text', required: true },
      { id: 'puesto', label: 'Puesto o Categoría', placeholder: 'Analista de Operaciones Financieras', type: 'text', required: true },
      { id: 'salario_mensual', label: 'Salario Mensual Bruto ($ MXN)', placeholder: '25,000.00', type: 'currency', required: true },
      { id: 'salario_letra', label: 'Salario en Letra', placeholder: 'Veinticinco mil pesos 00/100 M.N.', type: 'text', required: true },
      { id: 'jornada', label: 'Tipo de Jornada Laboral', placeholder: 'Diurna de 48 horas semanales (Lunes a Viernes de 9:00 a 18:00 hrs)', type: 'text', defaultValue: 'Diurna de lunes a viernes de 09:00 a 18:00 horas', required: true },
      { id: 'fecha_inicio', label: 'Fecha de Inicio de Labores', type: 'date', required: true },
    ],
    toggles: [
      {
        id: 'periodo_prueba',
        label: 'Estipular Período de Prueba (30 Días)',
        description: 'Incluye la cláusula de período de prueba improrrogable en términos del Art. 39-A LFT.',
        defaultActive: true,
        content: '\nCLÁUSULA ESPECIAL.- PERÍODO DE PRUEBA. Las Partes convienen en sujetar el presente contrato a un período de prueba de 30 (treinta) días naturales conforme al Artículo 39-A de la Ley Federal del Trabajo, con el fin de verificar que el TRABAJADOR reúne los requisitos y conocimientos necesarios para desempeñar el puesto.',
      },
    ],
    templateHandlebars: `CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO INDETERMINADO

Que celebran por una parte {{patron_nombre}}, representada por {{patron_rep}} ("PATRÓN"), y por la otra parte el C. {{trabajador_nombre}} ("TRABAJADOR"), al tenor de las siguientes:

DECLARACIONES

I. Declara el PATRÓN ser una persona moral con domicilio en {{patron_domicilio}}, requiriendo los servicios personales y subordinados del TRABAJADOR.
II. Declara el TRABAJADOR ser de nacionalidad mexicana, con RFC/CURP {{trabajador_rfc}}, con domicilio en {{trabajador_domicilio}}, apto para el desempeño del puesto.

CLÁUSULAS

PRIMERA.- OBJETO Y PUESTO. El PATRÓN contrata al TRABAJADOR por tiempo indeterminado en el puesto de {{puesto}}.
SEGUNDA.- LUGAR DE TRABAJO. El TRABAJADOR prestará sus servicios en: {{patron_domicilio}}.
TERCERA.- JORNADA DE TRABAJO. La jornada de trabajo será {{jornada}}, con derecho a descanso semanal con goce íntegro de salario.
CUARTA.- SALARIO. El TRABAJADOR percibirá un salario mensual bruto de $ {{salario_mensual}} ({{salario_letra}}), pagadero los días 15 y último de cada mes.
QUINTA.- PRESTACIONES. El TRABAJADOR gozará de aguinaldo, prima vacacional y vacaciones conforme a la Ley Federal del Trabajo.{{#if toggle_periodo_prueba}}{{toggle_periodo_prueba}}{{/if}}
SEXTA.- CONFIDENCIALIDAD. El TRABAJADOR se obliga a guardar estricta reserva de los secretos técnicos y comerciales del PATRÓN.

POR EL PATRÓN:
{{patron_nombre}}
Por: {{patron_rep}}
Firma: ________________________________________

EL TRABAJADOR:
{{trabajador_nombre}}
Firma: ________________________________________
`,
  },
  {
    id: 'laboral-teletrabajo',
    title: 'Anexo de Teletrabajo (Home Office - Art. 330 LFT)',
    description: 'Anexo normativo obligatorio para modalidad remota, dotación de equipo, costos de conectividad y derecho a la desconexión digital.',
    module: 'laboral',
    intentGroup: 'Regular Modalidad',
    outputLabel: 'Anexo de Teletrabajo',
    fields: [
      { id: 'patron_nombre', label: 'Nombre o Razón Social del Patrón', placeholder: 'Empresas Digitales de México, S.A. de C.V.', type: 'text', required: true },
      { id: 'trabajador_nombre', label: 'Nombre Completo del Trabajador', placeholder: 'Sofía Castro Mendoza', type: 'text', required: true },
      { id: 'domicilio_remoto', label: 'Domicilio donde se prestará el Teletrabajo', placeholder: 'Calle Colima 180, Depto 4, Roma Norte, CDMX', type: 'text', required: true },
      { id: 'equipo_entregado', label: 'Equipo y Herramientas Entregadas', placeholder: 'Laptop Dell Latitude Core i7, monitor 24 pulgadas, mouse y diadema telefónica', type: 'textarea', required: true },
      { id: 'monto_conectividad', label: 'Apoyo Mensual por Conectividad y Electricidad ($ MXN)', placeholder: '500.00', type: 'currency', defaultValue: '500.00', required: true },
      { id: 'horario_disponibilidad', label: 'Horario de Jornada y Contacto', placeholder: '09:00 a 18:00 horas de lunes a viernes', type: 'text', defaultValue: '09:00 a 18:00 horas', required: true },
    ],
    templateHandlebars: `ANEXO AL CONTRATO INDIVIDUAL DE TRABAJO: MODALIDAD DE TELETRABAJO (HOME OFFICE)

Conforme a las reformas a los Artículos 330-A al 330-K de la Ley Federal del Trabajo, celebran el presente Anexo {{patron_nombre}} ("PATRÓN") y {{trabajador_nombre}} ("TRABAJADOR").

CLÁUSULAS

PRIMERA.- LUGAR DE PRESTACIÓN DEL SERVICIO. El TRABAJADOR desempeñará sus funciones bajo modalidad de Teletrabajo en: {{domicilio_remoto}}.
SEGUNDA.- EQUIPO Y HERRAMIENTAS. El PATRÓN entrega en perfecto estado: {{equipo_entregado}}.
TERCERA.- COSTOS DE CONECTIVIDAD. El PATRÓN pagará mensualmente la cantidad de $ {{monto_conectividad}} M.N. por concepto proporcional de internet y electricidad.
CUARTA.- DESCONEXIÓN DIGITAL. El TRABAJADOR tendrá derecho a la desconexión digital fuera de su horario laboral ({{horario_disponibilidad}}).
QUINTA.- REVERSIBILIDAD. Las Partes reconocen el derecho de retorno a modalidad presencial mediante aviso de 15 días.

POR EL PATRÓN:
{{patron_nombre}}
Firma: ________________________________________

EL TRABAJADOR:
{{trabajador_nombre}}
Firma: ________________________________________
`,
  },
  {
    id: 'laboral-convenio-terminacion',
    title: 'Convenio de Terminación Laboral y Finiquito',
    description: 'Documento de cierre de relación de trabajo voluntario con desglose de liquidación/finiquito y carta finiquito de no adeudo.',
    module: 'laboral',
    intentGroup: 'Cerrar Relación',
    outputLabel: 'Convenio de Finiquito',
    fields: [
      { id: 'patron_nombre', label: 'Razón Social del Patrón', placeholder: 'Operaciones Comerciales del Sur, S.A. de C.V.', type: 'text', required: true },
      { id: 'patron_rep', label: 'Representante del Patrón', placeholder: 'Lic. Sergio Navarrete Soto', type: 'text', required: true },
      { id: 'trabajador_nombre', label: 'Nombre del Trabajador', placeholder: 'Eduardo Morales Benítez', type: 'text', required: true },
      { id: 'puesto_trabajador', label: 'Puesto Desempeñado', placeholder: 'Coordinador de Almacén', type: 'text', required: true },
      { id: 'fecha_ingreso', label: 'Fecha de Ingreso', type: 'date', required: true },
      { id: 'fecha_baja', label: 'Fecha de Terminación / Baja', type: 'date', required: true },
      { id: 'monto_total_finiquito', label: 'Monto Total Neto del Finiquito ($ MXN)', placeholder: '38,500.00', type: 'currency', required: true },
      { id: 'monto_letra', label: 'Monto en Letra', placeholder: 'Treinta y ocho mil quinientos pesos 00/100 M.N.', type: 'text', required: true },
    ],
    templateHandlebars: `CONVENIO DE TERMINACIÓN DE LA RELACIÓN DE TRABAJO Y RECIBO FINIQUITO

En la Ciudad de México, al día {{fecha_baja}}, comparecen {{patron_nombre}}, representada por {{patron_rep}} ("PATRÓN"), y el C. {{trabajador_nombre}} ("TRABAJADOR"), manifestando:
1. Que el TRABAJADOR ingresó el {{fecha_ingreso}} como {{puesto_trabajador}}.
2. Que de mutuo acuerdo y con fundamento en el Artículo 53 Fracción I de la LFT dan por terminada la relación laboral.
3. El PATRÓN entrega la cantidad neta de $ {{monto_total_finiquito}} ({{monto_letra}}) por concepto de finiquito y prestaciones devengadas.
El TRABAJADOR extiende al PATRÓN el más amplio finiquito que en derecho proceda.

POR EL PATRÓN:
{{patron_nombre}}
Por: {{patron_rep}}
Firma: ________________________________________

EL TRABAJADOR:
{{trabajador_nombre}}
Firma: ________________________________________
`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ── 3. FISCAL Y PATRIMONIAL ────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'fiscal-prestacion-servicios',
    title: 'Contrato de Servicios Profesionales con Cláusulas Fiscales',
    description: 'Contrato con cláusulas de estricta materialidad (Art. 69-B CFF), entregables, CFDI, retenciones legales y no relación laboral.',
    module: 'fiscal',
    intentGroup: 'Contratar / Operar',
    outputLabel: 'Servicios Profesionales',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'prestador_nombre', label: 'Nombre o Razón Social del Prestador', placeholder: 'Asesoría y Estrategia Fiscal SC', type: 'text', required: true },
      { id: 'prestador_rfc', label: 'RFC del Prestador', placeholder: 'AEF180512XYZ', type: 'text', required: true },
      { id: 'prestador_rep', label: 'Representante del Prestador', placeholder: 'C.P. Gabriel Ruiz Montes', type: 'text', required: true },
      { id: 'cliente_nombre', label: 'Nombre o Razón Social del Cliente', placeholder: 'Comercializadora Vanguardia, S.A. de C.V.', type: 'text', required: true },
      { id: 'cliente_rfc', label: 'RFC del Cliente', placeholder: 'CVG120304ABC', type: 'text', required: true },
      { id: 'cliente_rep', label: 'Representante del Cliente', placeholder: 'Lic. Mónica Suárez Peña', type: 'text', required: true },
      { id: 'objeto_servicio', label: 'Descripción Detallada de los Servicios y Entregables', placeholder: 'Auditoría tributaria preventiva, dictamen de estados financieros y soporte de materialidad de operaciones', type: 'textarea', required: true },
      { id: 'honorarios_monto', label: 'Honorarios Totales o Mensuales ($ MXN)', placeholder: '60,000.00', type: 'currency', required: true },
      { id: 'honorarios_letra', label: 'Honorarios en Letra', placeholder: 'Sesenta mil pesos 00/100 M.N.', type: 'text', required: true },
    ],
    toggles: [
      {
        id: 'retenciones_fiscales',
        label: 'Cláusula de Retención de ISR e IVA (Persona Física a Moral)',
        description: 'Aplica las retenciones de ley del 10% ISR y 2/3 partes del IVA cuando el prestador sea persona física.',
        defaultActive: false,
        content: '\nCLÁUSULA FISCAL.- RETENCIONES. En virtud de que el PRESTADOR tributa como persona física, el CLIENTE retendrá el 10% por concepto de Impuesto sobre la Renta (ISR) y las 2/3 partes del Impuesto al Valor Agregado (IVA), expidiendo la constancia de retenciones correspondiente.',
      },
    ],
    templateHandlebars: `CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES INDEPENDIENTES

Que celebran en {{ciudad_firma}}, a {{fecha_firma}}, por una parte {{prestador_nombre}}, con RFC {{prestador_rfc}}, representada por {{prestador_rep}} ("PRESTADOR"), y por la otra parte {{cliente_nombre}}, con RFC {{cliente_rfc}}, representada por {{cliente_rep}} ("CLIENTE"), al tenor de las siguientes:

DECLARACIONES

I. Declara el PRESTADOR que cuenta con capacidad y solvencia material para prestar los servicios con plena autonomía.
II. Declara el CLIENTE que requiere los servicios profesionales descritos en este instrumento.

CLÁUSULAS

PRIMERA.- OBJETO Y MATERIALIDAD. El PRESTADOR ejecutará a favor del CLIENTE: {{objeto_servicio}}, entregando reportes materiales para efectos del Artículo 69-B del CFF.
SEGUNDA.- HONORARIOS. El CLIENTE pagará la cantidad de $ {{honorarios_monto}} ({{honorarios_letra}}) más IVA, previa entrega del CFDI correspondiente timbrado.{{#if toggle_retenciones_fiscales}}{{toggle_retenciones_fiscales}}{{/if}}
TERCERA.- NATURALEZA CIVIL. Las Partes reconocen que el presente contrato es estrictamente civil-mercantil, sin subordinación laboral.
CUARTA.- JURISDICCIÓN. Las Partes se someten a los tribunales de {{ciudad_firma}}.

POR EL PRESTADOR:
{{prestador_nombre}}
Por: {{prestador_rep}}
Firma: ________________________________________

POR EL CLIENTE:
{{cliente_nombre}}
Por: {{cliente_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'fiscal-mutuo-interes',
    title: 'Contrato de Mutuo con Interés Mercantil y Trazabilidad',
    description: 'Préstamo dinerario entre partes con pagaré anexo, calendario de amortizaciones, cuenta bancaria para trazabilidad y retención.',
    module: 'fiscal',
    intentGroup: 'Garantizar / Cobrar',
    outputLabel: 'Mutuo con Interés',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Monterrey, N.L.', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'mutuante_nombre', label: 'Nombre o Razón Social del Mutuante (Prestamista)', placeholder: 'Inversiones Patrimoniales del Norte, S.A. de C.V.', type: 'text', required: true },
      { id: 'mutuante_rep', label: 'Representante del Mutuante', placeholder: 'Lic. Gerardo Garza Guerra', type: 'text', required: true },
      { id: 'mutuario_nombre', label: 'Nombre o Razón Social del Mutuario (Prestatario)', placeholder: 'Desarrollos Inmobiliarios Santa Fe, S.A. de C.V.', type: 'text', required: true },
      { id: 'mutuario_rep', label: 'Representante del Mutuario', placeholder: 'Ing. Daniel Cantú Salinas', type: 'text', required: true },
      { id: 'monto_prestamo', label: 'Monto del Préstamo ($ MXN)', placeholder: '1,500,000.00', type: 'currency', required: true },
      { id: 'monto_letra', label: 'Monto en Letra', placeholder: 'Un millón quinientos mil pesos 00/100 M.N.', type: 'text', required: true },
      { id: 'tasa_interes_anual', label: 'Tasa de Interés Ordinario Anual (%)', placeholder: '12.0', type: 'number', defaultValue: '12.0', required: true },
      { id: 'plazo_meses', label: 'Plazo Total del Mutuo (Meses)', placeholder: '12', type: 'number', defaultValue: '12', required: true },
      { id: 'cuenta_deposito', label: 'Cuenta / CLABE Bancaria para Dispersión (Trazabilidad)', placeholder: '012180001234567890 (BBVA)', type: 'text', required: true },
    ],
    templateHandlebars: `CONTRATO DE MUTUO CON INTERÉS

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{mutuante_nombre}}, representada por {{mutuante_rep}} ("MUTUANTE"), y por la otra {{mutuario_nombre}}, representada por {{mutuario_rep}} ("MUTUARIO"), al tenor de las siguientes:

DECLARACIONES

I. Declara el MUTUANTE que los recursos provienen de fuentes lícitas.
II. Declara el MUTUARIO que requiere el mutuo para sus actividades corporativas.

CLÁUSULAS

PRIMERA.- OBJETO Y TRAZABILIDAD. El MUTUANTE entrega en mutuo al MUTUARIO la cantidad de $ {{monto_prestamo}} ({{monto_letra}}), mediante SPEI a la cuenta CLABE: {{cuenta_deposito}}.
SEGUNDA.- INTERESES. El capital insoluto causará un interés ordinario del {{tasa_interes_anual}}% anual.
TERCERA.- PLAZO. El MUTUARIO se obliga a restituir la totalidad del préstamo en {{plazo_meses}} meses.
CUARTA.- JURISDICCIÓN. Para la interpretación y cumplimiento, se someten a los tribunales de {{ciudad_firma}}.

POR EL MUTUANTE:
{{mutuante_nombre}}
Por: {{mutuante_rep}}
Firma: ________________________________________

POR EL MUTUARIO:
{{mutuario_nombre}}
Por: {{mutuario_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'fiscal-escrito-sat',
    title: 'Escrito Libre de Aclaración ante el SAT',
    description: 'Escrito formal con fundamento en los Artículos 18 y 18-A del CFF para atender cartas invitación, discrepancias o requerimientos.',
    module: 'fiscal',
    intentGroup: 'Contestar / Aclarar',
    outputLabel: 'Escrito Libre SAT',
    fields: [
      { id: 'autoridad_sat', label: 'Administración Desconcentrada Destinataria', placeholder: 'Administración Desconcentrada de Auditoría Fiscal de Jalisco "1"', type: 'text', required: true },
      { id: 'contribuyente_nombre', label: 'Nombre o Razón Social del Contribuyente', placeholder: 'Distribuidora Tapatía de Alimentos, S.A. de C.V.', type: 'text', required: true },
      { id: 'contribuyente_rfc', label: 'RFC del Contribuyente', placeholder: 'DTA150918ABC', type: 'text', required: true },
      { id: 'domicilio_fiscal', label: 'Domicilio Fiscal para Oír y Recibir Notificaciones', placeholder: 'Av. Américas 1500, Piso 8, Providencia, Guadalajara, Jal.', type: 'text', required: true },
      { id: 'folio_requerimiento', label: 'Número de Folio / Oficio / Carta Invitación', placeholder: '500-24-00-02-01-2026-12345', type: 'text', required: true },
      { id: 'hechos_aclaracion', label: 'Hechos y Argumentación Jurídico-Contable', placeholder: 'Que en relación con la supuesta diferencia en retenciones de ISR de sueldos y salarios del ejercicio 2025, se aclara que los pagos fueron enterados oportunamente según constancias bancarias adjuntas...', type: 'textarea', required: true },
    ],
    templateHandlebars: `ASUNTO: ESCRITO LIBRE DE ACLARACIÓN LEGAL
OFICIO / CARTA INVITACIÓN: {{folio_requerimiento}}

H. {{autoridad_sat}}
SERVICIO DE ADMINISTRACIÓN TRIBUTARIA
PRESENTE.

El que suscribe, en representación legal de {{contribuyente_nombre}}, con RFC {{contribuyente_rfc}}, con domicilio fiscal en {{domicilio_fiscal}}, comparezco respetuosamente para exponer:

Que con fundamento en los Artículos 8vo Constitucional y Artículos 18, 18-A y 33 del Código Fiscal de la Federación, vengo a presentar ACLARACIÓN respecto de las observaciones comunicadas en el oficio {{folio_requerimiento}}:

HECHOS Y ACLARACIONES:
{{hechos_aclaracion}}

PETICIONES:
ÚNICO.- Tenerme por presentado en tiempo y forma, teniendo por solventadas las observaciones formuladas.

Protesto lo necesario.

{{contribuyente_nombre}}
Firma del Representante Legal: ________________________________________
`,
  },
  {
    id: 'fiscal-servicios-repse',
    title: 'Contrato de Servicios Especializados (Cumplimiento REPSE)',
    description: 'Contrato de prestación de servicios especializados en estricto apego al Art. 15 del CFF y Art. 13-15 de la LFT con folio REPSE.',
    module: 'fiscal',
    intentGroup: 'Contratar / Operar',
    outputLabel: 'Contrato REPSE',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'contratista_nombre', label: 'Razón Social de la Contratista (REPSE)', placeholder: 'Mantenimiento Especializado e Ingeniería, S.A. de C.V.', type: 'text', required: true },
      { id: 'contratista_repse', label: 'Número de Folio y Registro REPSE', placeholder: 'AR12345/2026', type: 'text', required: true },
      { id: 'contratista_rep', label: 'Representante de la Contratista', placeholder: 'Ing. Carlos Vega Morales', type: 'text', required: true },
      { id: 'cliente_nombre', label: 'Razón Social de la Contratante', placeholder: 'Parque Logístico Industrial del Norte, S.A. de C.V.', type: 'text', required: true },
      { id: 'cliente_rep', label: 'Representante de la Contratante', placeholder: 'Lic. Andrea Domínguez Fox', type: 'text', required: true },
      { id: 'objeto_especializado', label: 'Descripción del Servicio Especializado', placeholder: 'Mantenimiento preventivo y correctivo de subestaciones eléctricas de alta tensión y sistemas contra incendio', type: 'textarea', required: true },
      { id: 'contraprestacion_mensual', label: 'Contraprestación Mensual ($ MXN)', placeholder: '120,000.00', type: 'currency', required: true },
    ],
    templateHandlebars: `CONTRATO DE PRESTACIÓN DE SERVICIOS ESPECIALIZADOS (REPSE)

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{contratista_nombre}}, con registro REPSE número {{contratista_repse}}, representada por {{contratista_rep}} ("CONTRATISTA"), y por la otra {{cliente_nombre}}, representada por {{cliente_rep}} ("CONTRATANTE"), al tenor de las siguientes:

DECLARACIONES

I. Declara la CONTRATISTA contar con registro vigente en el Padrón Público de Contratistas de Servicios Especializados (REPSE) bajo el folio {{contratista_repse}}.
II. Declara la CONTRATANTE que los servicios no forman parte de su objeto social preponderante.

CLÁUSULAS

PRIMERA.- OBJETO. La CONTRATISTA prestará a la CONTRATANTE los servicios de: {{objeto_especializado}}.
SEGUNDA.- CUMPLIMIENTO FISCAL (ART. 15 CFF). La CONTRATISTA entregará mensualmente copia de CFDI, declaraciones de retenciones de ISR, cuotas IMSS/INFONAVIT y declaración de IVA.
TERCERA.- PRECIO. La CONTRATANTE pagará mensualmente la cantidad de $ {{contraprestacion_mensual}} M.N. más IVA contra entrega del soporte fiscal.
CUARTA.- JURISDICCIÓN. Se someten a los tribunales de {{ciudad_firma}}.

POR LA CONTRATISTA:
{{contratista_nombre}}
Por: {{contratista_rep}}
Firma: ________________________________________

POR LA CONTRATANTE:
{{cliente_nombre}}
Por: {{cliente_rep}}
Firma: ________________________________________
`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ── 4. COMERCIO EXTERIOR ───────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'comercio_exterior-aviso-privacidad',
    title: 'Aviso de Privacidad (Comercio Exterior y Logística)',
    description: 'Aviso de privacidad integral conforme a la LFPDPPP para recolección de datos de importadores, exportadores, pedimentos y despacho.',
    module: 'comercio_exterior',
    intentGroup: 'Cumplimiento Legal',
    outputLabel: 'Aviso de Privacidad',
    fields: [
      { id: 'responsable_nombre', label: 'Nombre o Razón Social del Responsable', placeholder: 'Logística y Aduanas Internacionales de México, S.A. de C.V.', type: 'text', required: true },
      { id: 'responsable_domicilio', label: 'Domicilio Completo del Responsable', placeholder: 'Av. Paseo de la Reforma 250, Piso 8, Cuauhtémoc, CDMX', type: 'text', required: true },
      { id: 'responsable_email', label: 'Correo Electrónico de Contacto Institucional', placeholder: 'privacidad@logisticalex.mx', type: 'text', required: true },
      { id: 'email_derechos_arco', label: 'Correo para Ejercicio de Derechos ARCO', placeholder: 'arco@logisticalex.mx', type: 'text', required: true },
      { id: 'sitio_web_avisos', label: 'Sitio Web para Publicación de Cambios', placeholder: 'https://www.logisticalex.mx/privacidad', type: 'text', required: true },
      { id: 'representante_nombre', label: 'Nombre del Representante Legal o Delegado de Privacidad', placeholder: 'Lic. Fernando Ortiz Morales', type: 'text', required: true },
      { id: 'fecha_emision', label: 'Fecha de Emisión / Actualización', type: 'date', required: true },
    ],
    templateHandlebars: `AVISO DE PRIVACIDAD PARA OPERACIONES DE COMERCIO EXTERIOR

Responsable del tratamiento: {{responsable_nombre}}, con domicilio en {{responsable_domicilio}} y correo electrónico {{responsable_email}}.
En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y los Lineamientos aplicables, se informa lo siguiente:

1. DATOS PERSONALES RECABADOS:
Para llevar a cabo operaciones de comercio exterior, importación, exportación, despacho aduanero, logística, transporte, facturación y cumplimiento fiscal, recabamos:
- Datos de identificación: Nombre, razón social, RFC, CURP, nacionalidad, domicilio fiscal, teléfono y correo electrónico.
- Datos patrimoniales y financieros: Cuentas bancarias, CLABE interbancaria, historial crediticio.
- Datos fiscales y aduaneros: Información de pedimentos, facturas comerciales (COVE), certificados de origen, permisos y documentos aduaneros.

2. FINALIDADES DEL TRATAMIENTO:
Finalidades primarias:
- Realizar trámites de despacho aduanero, importación y exportación de mercancías.
- Elaborar pedimentos, facturas, cartas encomienda y manifestaciones de valor.
- Cumplir con obligaciones ante el SAT, la Agencia Nacional de Aduanas de México (ANAM) y demás autoridades.
- Gestionar permisos, regulaciones y restricciones no arancelarias.

3. TRANSFERENCIA DE DATOS:
Los datos podrán ser transferidos a autoridades aduaneras y fiscales, agentes aduanales, transportistas y entidades bancarias en los supuestos del artículo 37 de la LFPDPPP.

4. DERECHOS ARCO:
Usted podrá ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición enviando su solicitud a: {{email_derechos_arco}}.

5. MODIFICACIONES:
Cualquier cambio a este aviso de privacidad estará disponible en: {{sitio_web_avisos}}.

Fecha de emisión: {{fecha_emision}}

REPRESENTANTE LEGAL:
{{responsable_nombre}}
Por: {{representante_nombre}}
Firma: ________________________________________
`,
  },
  {
    id: 'comercio_exterior-compraventa-cisg',
    title: 'Contrato de Compraventa Internacional de Mercaderías (CISG / Incoterms)',
    description: 'Contrato formal bajo la Convención de Viena (CISG), Incoterms 2020, cartas de crédito, inspección de calidad y cláusula arbitral.',
    module: 'comercio_exterior',
    intentGroup: 'Importar / Exportar',
    outputLabel: 'Compraventa Internacional',
    fields: [
      { id: 'ciudad_firma', label: 'Lugar y Ciudad de Celebración', placeholder: 'Ciudad de México, México / Houston, TX', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'vendedor_nombre', label: 'Nombre o Razón Social del Vendedor (Exportador)', placeholder: 'Global Industrial Machinery LLC', type: 'text', required: true },
      { id: 'vendedor_pais', label: 'País y Domicilio del Vendedor', placeholder: 'Houston, Texas, Estados Unidos', type: 'text', required: true },
      { id: 'vendedor_taxid', label: 'Tax ID / Identificación Fiscal del Vendedor', placeholder: 'EIN 12-3456789', type: 'text', required: true },
      { id: 'vendedor_rep', label: 'Representante del Vendedor', placeholder: 'Mr. Johnathan Davis', type: 'text', required: true },
      { id: 'comprador_nombre', label: 'Nombre o Razón Social del Comprador (Importador)', placeholder: 'Importaciones y Maquinarias de México, S.A. de C.V.', type: 'text', required: true },
      { id: 'comprador_pais', label: 'País y Domicilio del Comprador', placeholder: 'Ciudad de México, México', type: 'text', required: true },
      { id: 'comprador_taxid', label: 'RFC / Tax ID del Comprador', placeholder: 'IMM160420ABC', type: 'text', required: true },
      { id: 'comprador_rep', label: 'Representante del Comprador', placeholder: 'Lic. Andrés Salgado Peña', type: 'text', required: true },
      { id: 'descripcion_mercancia', label: 'Descripción Detallada de las Mercancías', placeholder: '3 Centros de Maquinado CNC de 5 Ejes Mod. PrecisionTech 2026', type: 'textarea', required: true },
      { id: 'cantidad_unidades', label: 'Cantidad y Fracción Arancelaria', placeholder: '3 Unidades · Fracción: 8457.10.01', type: 'text', required: true },
      { id: 'monto_total_divisa', label: 'Monto Total de la Transacción (Divisa)', placeholder: '350,000.00 USD', type: 'text', required: true },
      { id: 'monto_letra', label: 'Monto en Letra', placeholder: 'Trescientos cincuenta mil dólares 00/100 USD', type: 'text', required: true },
      { id: 'incoterm_aplicable', label: 'Incoterm Aplicable (Versión 2020)', placeholder: 'CIF Puerto de Manzanillo, México (Incoterms 2020)', type: 'text', defaultValue: 'CIF Puerto de Manzanillo (Incoterms 2020)', required: true },
      { id: 'medio_pago_internacional', label: 'Medio de Pago Internacional', placeholder: 'Carta de Crédito Irrevocable y Confirmada pagadera a la vista', type: 'text', defaultValue: 'Carta de Crédito Confirmada', required: true },
      { id: 'plazo_entrega_dias', label: 'Plazo de Embarque / Entrega (Días)', placeholder: '30 días posteriores a la apertura de la carta de crédito', type: 'text', defaultValue: '30 días', required: true },
      { id: 'dias_reclamo_conformidad', label: 'Plazo para Reclamos de Conformidad tras Arribo (Días)', placeholder: '15', type: 'number', defaultValue: '15', required: true },
      { id: 'ciudad_arbitraje', label: 'Sede y Reglas de Arbitraje', placeholder: 'Cámara de Comercio Internacional (CCI) en la Ciudad de México', type: 'text', defaultValue: 'Cámara de Comercio Internacional (CCI)', required: true },
    ],
    templateHandlebars: `CONTRATO DE COMPRAVENTA INTERNACIONAL DE MERCANCÍAS (CISG)

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{vendedor_nombre}}, con Tax ID {{vendedor_taxid}}, con domicilio en {{vendedor_pais}}, representada por {{vendedor_rep}} ("EL VENDEDOR"), y por la otra {{comprador_nombre}}, con RFC/Tax ID {{comprador_taxid}}, con domicilio en {{comprador_pais}}, representada por {{comprador_rep}} ("EL COMPRADOR"), al tenor de las siguientes:

DECLARACIONES

I. Declara EL VENDEDOR contar con capacidad y legitimación para exportar las mercancías objeto de este instrumento.
II. Declara EL COMPRADOR contar con capacidad económica y jurídica para importar las mercancías en su país de destino.
III. Declaran ambas Partes que se sujetan a las disposiciones de la Convención de las Naciones Unidas sobre los Contratos de Compraventa Internacional de Mercaderías (CISG) y los Incoterms® 2020 de la Cámara de Comercio Internacional.

CLÁUSULAS

PRIMERA.- OBJETO. EL VENDEDOR vende y entrega a EL COMPRADOR las mercancías siguientes:
- Descripción: {{descripcion_mercancia}}
- Cantidad y especificaciones: {{cantidad_unidades}}

SEGUNDA.- PRECIO E INCOTERMS. El precio total asciende a {{monto_total_divisa}} ({{monto_letra}}), estipulado bajo la regla Incoterms®: {{incoterm_aplicable}}.

TERCERA.- CONDICIONES DE PAGO. El pago se realizará mediante {{medio_pago_internacional}}, contra presentación de los documentos de embarque (Factura comercial, Conocimiento de embarque B/L, Certificado de origen y Lista de empaque).

CUARTA.- ENTREGA Y CONFORMIDAD. La entrega se efectuará dentro de: {{plazo_entrega_dias}}. EL COMPRADOR tendrá derecho a inspeccionar las mercancías y formular reclamos por falta de conformidad dentro de los {{dias_reclamo_conformidad}} días naturales posteriores a su arribo a puerto.

QUINTA.- ARBITRAJE Y SOLUCIÓN DE CONTROVERSIAS. Toda controversia derivada de este contrato será resuelta definitivamente mediante arbitraje de conformidad con el reglamento de: {{ciudad_arbitraje}}.

POR EL VENDEDOR:
{{vendedor_nombre}}
Por: {{vendedor_rep}}
Firma: ________________________________________

POR EL COMPRADOR:
{{comprador_nombre}}
Por: {{comprador_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'comercio_exterior-carta-instrucciones',
    title: 'Carta de Instrucciones al Agente Aduanal',
    description: 'Instrucciones formales para el despacho aduanero de importación/exportación con régimen, aduana, documentos y transporte.',
    module: 'comercio_exterior',
    intentGroup: 'Coordinar Despacho',
    outputLabel: 'Carta de Instrucciones',
    fields: [
      { id: 'fecha_carta', label: 'Fecha de la Carta', type: 'date', required: true },
      { id: 'agente_aduanal', label: 'Nombre del Agente Aduanal / Agencia Aduanal', placeholder: 'Agencia Aduanal del Pacífico, S.C. (Patente 3450)', type: 'text', required: true },
      { id: 'aduana_despacho', label: 'Aduana de Despacho', placeholder: 'Aduana de Manzanillo (Aduana 160)', type: 'text', required: true },
      { id: 'importador_nombre', label: 'Razón Social del Importador', placeholder: 'Comercializadora de Electrónicos de México, S.A. de C.V.', type: 'text', required: true },
      { id: 'importador_rfc', label: 'RFC del Importador con Padrón Activo', placeholder: 'CEM140220XYZ', type: 'text', required: true },
      { id: 'regimen_aduanero', label: 'Régimen Aduanero Solicitado', placeholder: 'Importación Definitiva (A1)', type: 'text', defaultValue: 'Importación Definitiva (A1)', required: true },
      { id: 'descripcion_embarque', label: 'Detalle de la Mercancía y Bultos', placeholder: '1 Contenedor 40HC con 500 cajas de componentes electrónicos, Guía/BL: COSU12345678', type: 'textarea', required: true },
    ],
    templateHandlebars: `CARTA DE INSTRUCCIONES PARA DESPACHO ADUANERO

A: {{agente_aduanal}}
ADUANA DE ENTRADA: {{aduana_despacho}}
FECHA: {{fecha_carta}}

Por medio de la presente, la empresa {{importador_nombre}}, con RFC {{importador_rfc}}, le encomienda formalmente el despacho aduanero de las mercancías que a continuación se detallan:

1. RÉGIMEN ADUANERO: {{regimen_aduanero}}.
2. DESCRIPCIÓN DEL EMBARQUE: {{descripcion_embarque}}.
3. DOCUMENTOS ADJUNTOS:
   - Factura Comercial Digital (COVE).
   - Lista de Empaque (Packing List).
   - Conocimiento de Embarque / Guía Aérea (BL / AWB).
   - Certificado de Origen.
   - Manifestación de Valor y Hoja de Cálculo.

Declaramos bajo protesta de decir verdad que los valores, cantidades y descripciones manifestados son auténticos.

Atentamente,

{{importador_nombre}}
Firma del Representante Legal: ________________________________________
`,
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ── 5. ADUANAL Y DESPACHO ──────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'aduanal-servicios-agente',
    title: 'Contrato de Servicios de Agente Aduanal y Carta Encomienda',
    description: 'Prestación de servicios de despacho aduanal formal conforme al Art. 159 de la Ley Aduanera, clasificación arancelaria, honorarios y responsabilidades.',
    module: 'aduanal',
    intentGroup: 'Despacho Aduanal',
    outputLabel: 'Servicios Agente Aduanal',
    fields: [
      { id: 'ciudad_firma', label: 'Ciudad de Firma', placeholder: 'Veracruz, Ver.', type: 'text', required: true },
      { id: 'fecha_firma', label: 'Fecha de Firma', type: 'date', required: true },
      { id: 'agente_nombre_agencia', label: 'Nombre del Agente Aduanal / Razón Social de la Agencia', placeholder: 'Agencia Aduanal del Golfo, S.C.', type: 'text', required: true },
      { id: 'patente_aduanal_numero', label: 'Número de Patente Aduanal Autorizada (SAT)', placeholder: 'Patente No. 3890', type: 'text', required: true },
      { id: 'agente_domicilio', label: 'Domicilio del Agente Aduanal', placeholder: 'Av. Marina Mercante 210, Centro, Veracruz, Ver.', type: 'text', required: true },
      { id: 'cliente_nombre', label: 'Nombre o Razón Social del Cliente (Importador/Exportador)', placeholder: 'Distribuidora Internacional Mexicana, S.A. de C.V.', type: 'text', required: true },
      { id: 'cliente_rfc', label: 'RFC del Cliente', placeholder: 'DIM170911ABC', type: 'text', required: true },
      { id: 'cliente_domicilio', label: 'Domicilio del Cliente', placeholder: 'Av. Insurgentes Sur 1800, CDMX', type: 'text', required: true },
      { id: 'cliente_rep', label: 'Representante Legal del Cliente', placeholder: 'Lic. Sergio Navarrete Ruiz', type: 'text', required: true },
      { id: 'tipo_operacion', label: 'Tipo de Operaciones Encomendadas', placeholder: 'Importación y Exportación Definitiva y Temporal', type: 'text', defaultValue: 'Importación y Exportación', required: true },
      { id: 'aduana_despacho', label: 'Aduanas Autorizadas de Despacho', placeholder: 'Aduana de Veracruz (430) y Aduana de Manzanillo (160)', type: 'text', required: true },
      { id: 'honorarios_operacion', label: 'Honorarios Profesionales por Operación / Contenedor', placeholder: '0.45% sobre valor en aduana o tarifa fija de $4,500.00 M.N. por pedimento', type: 'text', required: true },
      { id: 'cuenta_bancaria_pago', label: 'Cuenta / CLABE para Anticipos y Gastos de Despacho', placeholder: 'Banorte · CLABE: 072180001234567890 a nombre de la Agencia', type: 'text', required: true },
    ],
    templateHandlebars: `CONTRATO DE PRESTACIÓN DE SERVICIOS DE AGENTE ADUANAL Y CARTA ENCOMIENDA

Que celebran en {{ciudad_firma}}, con fecha {{fecha_firma}}, por una parte {{agente_nombre_agencia}}, titular de la Patente Aduanal número {{patente_aduanal_numero}}, con domicilio en {{agente_domicilio}} ("EL AGENTE ADUANAL"), y por la otra parte {{cliente_nombre}}, con RFC {{cliente_rfc}}, representada por {{cliente_rep}} ("EL CLIENTE"), al tenor de las siguientes:

DECLARACIONES

I. Declara EL AGENTE ADUANAL estar autorizado por el SAT con la Patente {{patente_aduanal_numero}} en términos del artículo 159 de la Ley Aduanera para ejercer el despacho aduanero.
II. Declara EL CLIENTE ser propietario o consignatario de mercancías de comercio exterior con padrón de importadores activo.
III. Declaran ambas Partes que celebran el contrato conforme a los artículos 35, 36, 40, 41, 59, 159, 160 y 162 de la Ley Aduanera.

CLÁUSULAS

PRIMERA.- OBJETO. EL CLIENTE encomienda a EL AGENTE ADUANAL la tramitación y gestión del despacho aduanero de: {{tipo_operacion}}, en las aduanas de: {{aduana_despacho}}.

SEGUNDA.- CARTA ENCOMIENDA. Como anexo integrante, EL CLIENTE otorga Carta Encomienda conforme a la Ley Aduanera para la elaboración de pedimentos, clasificación arancelaria y pago de contribuciones por cuenta del cliente.

TERCERA.- OBLIGACIONES DEL CLIENTE. EL CLIENTE se obliga a entregar con veracidad toda la documentación aduanera (factura, COVE, lista de empaque, certificado de origen), declarar el valor real y proveer oportunamente los recursos para impuestos.

CUARTA.- CONTRAPRESTACIÓN. EL CLIENTE pagará los honorarios pactados consistentes en: {{honorarios_operacion}}, depositando anticipos para impuestos y maniobras en: {{cuenta_bancaria_pago}}.

QUINTA.- RESPONSABILIDAD. EL AGENTE ADUANAL actuará con debida diligencia conforme a los artículos 162 y 163 de la Ley Aduanera, sin asumir responsabilidad por datos inexactos provistos por EL CLIENTE.

SEXTA.- JURISDICCIÓN. Las Partes se someten a los tribunales competentes de {{ciudad_firma}}.

POR EL AGENTE ADUANAL:
{{agente_nombre_agencia}}
Patente: {{patente_aduanal_numero}}
Firma: ________________________________________

POR EL CLIENTE:
{{cliente_nombre}}
Por: {{cliente_rep}}
Firma: ________________________________________
`,
  },
  {
    id: 'aduanal-poder-especial',
    title: 'Poder Especial para Actos de Comercio Exterior y Despacho Aduanero',
    description: 'Mandato especial y representación para trámites de importación, pedimentos ante ANAM, SAT, IMPI, cupos y autorizaciones arancelarias.',
    module: 'aduanal',
    intentGroup: 'Representación Legal',
    outputLabel: 'Poder Especial Aduanal',
    fields: [
      { id: 'ciudad_otorgamiento', label: 'Ciudad de Otorgamiento', placeholder: 'Ciudad de México', type: 'text', required: true },
      { id: 'fecha_otorgamiento', label: 'Fecha de Otorgamiento', type: 'date', required: true },
      { id: 'poderdante_nombre', label: 'Nombre o Razón Social del Poderdante (Empresa)', placeholder: 'Grupo Comercial y Manufacturero de México, S.A. de C.V.', type: 'text', required: true },
      { id: 'poderdante_rfc', label: 'RFC del Poderdante', placeholder: 'GCM150618ABC', type: 'text', required: true },
      { id: 'poderdante_domicilio', label: 'Domicilio del Poderdante', placeholder: 'Av. Presidente Masaryk 111, Polanco, Miguel Hidalgo, CDMX', type: 'text', required: true },
      { id: 'poderdante_rep', label: 'Representante Legal que Otorga el Poder', placeholder: 'Lic. Fernando Morales Soto', type: 'text', required: true },
      { id: 'apoderado_nombre', label: 'Nombre Completo del Apoderado Especial', placeholder: 'Lic. Claudia Hernández Trejo', type: 'text', required: true },
      { id: 'apoderado_id_tipo_num', label: 'Identificación Oficial del Apoderado', placeholder: 'INE Clave Electoral: HNTCL85042009M100', type: 'text', required: true },
      { id: 'apoderado_rfc', label: 'RFC del Apoderado', placeholder: 'HETC850420XYZ', type: 'text', required: true },
      { id: 'apoderado_domicilio', label: 'Domicilio del Apoderado', placeholder: 'Calle Colima 150, Roma Norte, Cuauhtémoc, CDMX', type: 'text', required: true },
    ],
    templateHandlebars: `PODER ESPECIAL PARA ACTOS DE COMERCIO EXTERIOR Y ADUANEROS

En {{ciudad_otorgamiento}}, a {{fecha_otorgamiento}}.

PODERDANTE: {{poderdante_nombre}}, con RFC {{poderdante_rfc}}, con domicilio en {{poderdante_domicilio}}, representada por {{poderdante_rep}} ("EL PODERDANTE").
APODERADO: {{apoderado_nombre}}, con identificación {{apoderado_id_tipo_num}}, con RFC {{apoderado_rfc}}, con domicilio en {{apoderado_domicilio}} ("EL APODERADO").

CLÁUSULAS

PRIMERA.- OTORGAMIENTO. EL PODERDANTE otorga a favor de EL APODERADO poder especial para actos de comercio exterior y aduaneros, con fundamento en los artículos 2550 a 2587 del Código Civil Federal, Ley Aduanera y Código Fiscal de la Federación.

SEGUNDA.- FACULTADES CONFERIDAS. EL APODERADO queda facultado para:
a) Importar y exportar mercancías, presentar pedimentos y gestionar despachos aduaneros.
b) Comparecer ante las autoridades aduaneras (ANAM), fiscales (SAT), Secretaría de Economía e IMPI.
c) Suscribir solicitudes, cartas encomienda, manifestaciones de valor y recursos administrativos.
d) Designar y contratar agentes aduanales y empresas de logística.
e) Gestionar permisos previos, certificados de origen, cupos y resoluciones arancelarias.

TERCERA.- LIMITACIONES. El presente poder se limita estrictamente a actos de comercio exterior y aduaneros, sin facultades para disponer de inmuebles ni otorgar garantías no comerciales.

CUARTA.- RATIFICACIÓN Y VIGENCIA. EL PODERDANTE ratifica desde ahora todo lo actuado legalmente por EL APODERADO, manteniendo vigencia hasta su revocación por escrito.

POR EL PODERDANTE:
{{poderdante_nombre}}
Por: {{poderdante_rep}}
Firma: ________________________________________

EL APODERADO (ACEPTACIÓN):
{{apoderado_nombre}}
Firma: ________________________________________
`,
  },
  {
    id: 'aduanal-manifestacion-valor',
    title: 'Manifestación de Valor en Aduana e Incrementables',
    description: 'Documento soporte del valor en aduana conforme al Art. 59 de la Ley Aduanera con desglose de fletes, seguros y descuentos.',
    module: 'aduanal',
    intentGroup: 'Soportar Valor',
    outputLabel: 'Manifestación de Valor',
    fields: [
      { id: 'fecha_manifestacion', label: 'Fecha de Emisión', type: 'date', required: true },
      { id: 'importador_nombre', label: 'Razón Social del Importador', placeholder: 'Importadora Industrial del Centro, S.A. de C.V.', type: 'text', required: true },
      { id: 'importador_rfc', label: 'RFC del Importador', placeholder: 'IIC160822ABC', type: 'text', required: true },
      { id: 'proveedor_extranjero', label: 'Nombre del Proveedor Extranjero', placeholder: 'Shanghai Machinery Export Corp.', type: 'text', required: true },
      { id: 'factura_numero', label: 'Número de Factura Comercial', placeholder: 'EXP-2026-9874', type: 'text', required: true },
      { id: 'metodo_valoracion', label: 'Método de Valoración Aplicado', placeholder: 'Valor de Transacción de las Mercancías (Art. 64 Ley Aduanera)', type: 'text', defaultValue: 'Valor de Transacción de las Mercancías', required: true },
      { id: 'precio_pagado', label: 'Precio Pagado o por Pagar (Factura)', placeholder: '75,000.00 USD', type: 'text', required: true },
      { id: 'incrementables', label: 'Gastos Incrementables (Flete, Seguro, Embalaje)', placeholder: 'Flete marítimo: $3,200.00 USD / Seguro: $450.00 USD', type: 'textarea', required: true },
    ],
    templateHandlebars: `MANIFESTACIÓN DE VALOR EN ADUANA (ART. 59 LEY ADUANERA)

FECHA: {{fecha_manifestacion}}
IMPORTADOR: {{importador_nombre}}
RFC: {{importador_rfc}}
PROVEEDOR EN EL EXTRANJERO: {{proveedor_extranjero}}
FACTURA COMERCIAL: {{factura_numero}}

El que suscribe, en mi carácter de representante legal de la empresa importadora, manifiesto bajo protesta de decir verdad que:

1. MÉTODO DE VALORACIÓN: Se determina el valor en aduana conforme al método de {{metodo_valoracion}}.
2. PRECIO PAGADO: El precio efectivamente pagado o por pagar amparado en la factura señalada es de {{precio_pagado}}.
3. GASTOS INCREMENTABLES: Se adicionan los siguientes conceptos en términos del Artículo 65 de la Ley Aduanera:
   {{incrementables}}
4. VINCULACIÓN: Se manifiesta que NO existe vinculación comercial o societaria entre importador y proveedor que afecte el precio pactado.

REPRESENTANTE LEGAL:
{{importador_nombre}}
Firma: ________________________________________
`,
  },
  {
    id: 'aduanal-rectificacion-pedimento',
    title: 'Solicitud de Rectificación de Pedimento (Art. 89 LA)',
    description: 'Escrito técnico-jurídico para justificar la rectificación de campos del pedimento ante la aduana y evitar sanciones.',
    module: 'aduanal',
    intentGroup: 'Corregir Operación',
    outputLabel: 'Rectificación de Pedimento',
    fields: [
      { id: 'fecha_escrito', label: 'Fecha del Escrito', type: 'date', required: true },
      { id: 'aduana_despacho', label: 'Aduana de Adscripción', placeholder: 'Aduana de Nuevo Laredo, Tamaulipas', type: 'text', required: true },
      { id: 'contribuyente_nombre', label: 'Razón Social del Importador/Exportador', placeholder: 'Logística y Comercio Global, S.A. de C.V.', type: 'text', required: true },
      { id: 'pedimento_original', label: 'Número de Pedimento Original (15 Dígitos)', placeholder: '26  24  3450  6001234', type: 'text', required: true },
      { id: 'campo_a_corregir', label: 'Campo o Dato a Rectificar', placeholder: 'Fracción Arancelaria y País de Origen', type: 'text', required: true },
      { id: 'dato_incorrecto', label: 'Dato Asentado Incorrectamente', placeholder: 'Fracción 8471.30.01 / País: China', type: 'text', required: true },
      { id: 'dato_correcto', label: 'Dato Correcto Conforme a Documentos', placeholder: 'Fracción 8471.30.99 / País: Taiwán', type: 'text', required: true },
      { id: 'justificacion', label: 'Causa y Fundamentación de la Rectificación', placeholder: 'Error involuntario de captura en el sistema de prevalidación, corroborándose con el Certificado de Origen anexo...', type: 'textarea', required: true },
    ],
    templateHandlebars: `SOLICITUD DE RECTIFICACIÓN DE PEDIMENTO (ART. 89 LEY ADUANERA)

A: H. TITULAR DE LA {{aduana_despacho}}
FECHA: {{fecha_escrito}}
CONTRIBUYENTE: {{contribuyente_nombre}}
PEDIMENTO ORIGINAL: {{pedimento_original}}

Con fundamento en el Artículo 89 de la Ley Aduanera y las Reglas Generales de Comercio Exterior aplicables, comparezco para solicitar la rectificación del pedimento de referencia:

I. CAMPO A RECTIFICAR: {{campo_a_corregir}}
II. DATO INCORRECTO: {{dato_incorrecto}}
III. DATO CORRECTO QUE DEBE PREVALECER: {{dato_correcto}}
IV. MOTIVO Y JUSTIFICACIÓN:
{{justificacion}}

Se anexan las pruebas documentales que acreditan el dato correcto.

Atentamente,

{{contribuyente_nombre}}
Firma del Representante Legal: ________________________________________
`,
  },
];
