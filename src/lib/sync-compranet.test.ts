import { describe, expect, it } from 'vitest';
import {
  mergeLicitaciones,
  updateProcedureLifecycle,
  validateLicitacion,
  syncCompranet,
} from '../../scripts/sync-compranet.mjs';
import type { LicitacionPublica } from '../types';

const SAMPLE_LICITACION: LicitacionPublica = {
  id: 'lic-test-001',
  numeroProcedimiento: 'TEST-PROC-2026-01',
  expediente: 'EXP-TEST-001',
  titulo: 'Servicio de prueba para sincronización automatizada de CompraNet',
  descripcion: 'Descripción técnica de prueba para validación de esquema y ciclo de vida.',
  convocante: 'Secretaría de Prueba',
  siglasConvocante: 'SP',
  unidadCompradora: 'Dirección de Recursos Materiales',
  materia: 'servicios',
  caracter: 'nacional',
  tipoProcedimiento: 'licitacion_publica',
  estatus: 'recepcion_propuestas',
  entidadFederativa: 'Ciudad de México',
  fechaPublicacion: '2026-08-01',
  fechaLimitePropuestas: '2026-08-15T12:00:00',
  fechaFallo: '2026-08-30',
  montoEstimado: 10000000,
  moneda: 'MXN',
  marcoLegal: 'LAASSP Art. 26',
  enlaceCompraNet: 'https://comprasmx.buengobierno.gob.mx',
  requisitosClave: ['Opinión 32-D SAT'],
  anexosDisponibles: ['Bases Oficiales'],
};

describe('sync-compranet unit tests', () => {
  describe('validateLicitacion', () => {
    it('valida con éxito una licitación con todos los campos requeridos', () => {
      expect(validateLicitacion(SAMPLE_LICITACION)).toBe(true);
    });

    it('falla si falta un campo obligatorio', () => {
      const invalid = { ...SAMPLE_LICITACION, titulo: '' };
      expect(() => validateLicitacion(invalid)).toThrow(/Campo obligatorio/);
    });

    it('falla si la materia no pertenece al catálogo oficial', () => {
      const invalid = { ...SAMPLE_LICITACION, materia: 'materia_inexistente' as any };
      expect(() => validateLicitacion(invalid)).toThrow(/Materia no válida/);
    });

    it('falla si la moneda no es MXN ni USD', () => {
      const invalid = { ...SAMPLE_LICITACION, moneda: 'EUR' as any };
      expect(() => validateLicitacion(invalid)).toThrow(/Moneda no válida/);
    });
  });

  describe('updateProcedureLifecycle', () => {
    it('mantiene recepcion_propuestas si la fecha límite está en el futuro', () => {
      const futureRef = new Date('2026-08-10T00:00:00Z');
      const updated = updateProcedureLifecycle(SAMPLE_LICITACION, futureRef);

      expect(updated.estatus).toBe('recepcion_propuestas');
      expect(updated.fuenteOficial?.verificadaEl).toBe('2026-08-10');
    });

    it('avanza a evaluacion si la fecha límite ya venció pero aún no llega la fecha de fallo', () => {
      const evalRef = new Date('2026-08-20T00:00:00Z');
      const updated = updateProcedureLifecycle(SAMPLE_LICITACION, evalRef);

      expect(updated.estatus).toBe('evaluacion');
      expect(updated.fuenteOficial?.verificadaEl).toBe('2026-08-20');
    });

    it('avanza a fallo_emitido si la fecha de fallo ya pasó', () => {
      const falloRef = new Date('2026-09-05T00:00:00Z');
      const updated = updateProcedureLifecycle(SAMPLE_LICITACION, falloRef);

      expect(updated.estatus).toBe('fallo_emitido');
    });
  });

  describe('mergeLicitaciones', () => {
    it('actualiza un procedimiento existente sin duplicar su número', () => {
      const existing = [SAMPLE_LICITACION];
      const incoming = [{ ...SAMPLE_LICITACION, descripcion: 'Descripción actualizada' }];

      const result = mergeLicitaciones(existing, incoming);
      expect(result.merged).toHaveLength(1);
      expect(result.merged[0].descripcion).toBe('Descripción actualizada');
      expect(result.updatedCount).toBe(1);
      expect(result.addedCount).toBe(0);
    });

    it('agrega nuevos procedimientos preservando los existentes', () => {
      const existing = [SAMPLE_LICITACION];
      const incoming: LicitacionPublica = {
        ...SAMPLE_LICITACION,
        id: 'lic-test-002',
        numeroProcedimiento: 'TEST-PROC-2026-02',
      };

      const result = mergeLicitaciones(existing, [incoming]);
      expect(result.merged).toHaveLength(2);
      expect(result.addedCount).toBe(1);
    });
  });

  describe('syncCompranet execution', () => {
    it('ejecuta en modo dry-run sin arrojar errores', async () => {
      const result = await syncCompranet({ dryRun: true });
      expect(result.total).toBeGreaterThan(15);
      expect(result.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
