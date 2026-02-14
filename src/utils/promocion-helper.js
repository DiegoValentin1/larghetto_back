/**
 * =====================================================
 * HELPER: Promociones con Duración Limitada
 * =====================================================
 * Funciones para calcular descuentos vigentes basados
 * en la duración de las promociones.
 */

/**
 * Calcula los meses transcurridos entre dos fechas (basado en meses CALENDARIOS, no días exactos)
 * Si dice "3 meses de descuento", son EXACTAMENTE 3 meses calendarios.
 * @param {Date|string} fechaInicio - Fecha de inicio (DATE o string YYYY-MM-DD)
 * @param {Date|string} fechaReferencia - Fecha de referencia (DATE o string YYYY-MM-DD)
 * @returns {number} Número de meses calendarios transcurridos
 */
const calcularMesesTranscurridos = (fechaInicio, fechaReferencia) => {
    if (!fechaInicio || !fechaReferencia) return 0;

    const inicio = new Date(fechaInicio);
    const referencia = new Date(fechaReferencia);

    // Calcular diferencia en meses CALENDARIOS (año y mes, ignorando día)
    const meses = (referencia.getFullYear() - inicio.getFullYear()) * 12 +
                  (referencia.getMonth() - inicio.getMonth());

    return meses;
};

/**
 * Calcula el descuento vigente de una promoción
 * @param {Object} params - Parámetros
 * @param {number} params.descuento_original - Descuento de la promoción (0-100)
 * @param {number|null} params.duracion_meses - Duración en meses (NULL/0 = permanente)
 * @param {Date|string} params.fecha_inicio_promo - Fecha en que se asignó la promoción
 * @param {Date|string} params.fecha_referencia - Fecha a evaluar (default: hoy)
 * @returns {number} Descuento vigente (0-100)
 */
const calcularDescuentoVigente = ({
    descuento_original,
    duracion_meses,
    fecha_inicio_promo,
    fecha_referencia = new Date()
}) => {
    // Si no hay duración definida o es 0, la promoción es permanente
    if (!duracion_meses || duracion_meses === 0) {
        return descuento_original;
    }

    // Si no hay fecha de inicio de promoción, no aplicar descuento
    if (!fecha_inicio_promo) {
        return 0;
    }

    // Calcular meses transcurridos
    const mesesTranscurridos = calcularMesesTranscurridos(
        fecha_inicio_promo,
        fecha_referencia
    );

    // Si los meses transcurridos son menores a la duración, aplica descuento
    if (mesesTranscurridos < duracion_meses) {
        return descuento_original;
    }

    // La promoción expiró
    return 0;
};

/**
 * Calcula la mensualidad real con descuento vigente
 * @param {Object} params - Parámetros
 * @param {number} params.mensualidad - Mensualidad base
 * @param {number} params.descuento_original - Descuento de la promoción (0-100)
 * @param {number|null} params.duracion_meses - Duración en meses
 * @param {Date|string} params.fecha_inicio_promo - Fecha de asignación de promoción
 * @param {Date|string} params.fecha_referencia - Fecha a evaluar
 * @returns {number} Mensualidad real con descuento aplicado
 */
const calcularMensualidadReal = ({
    mensualidad,
    descuento_original,
    duracion_meses,
    fecha_inicio_promo,
    fecha_referencia = new Date()
}) => {
    const descuentoVigente = calcularDescuentoVigente({
        descuento_original,
        duracion_meses,
        fecha_inicio_promo,
        fecha_referencia
    });

    return mensualidad - (mensualidad * descuentoVigente / 100);
};

/**
 * Genera SQL CASE WHEN para calcular descuento vigente en queries
 * Usa diferencia de meses CALENDARIOS para dar exactamente N meses de descuento
 * @param {string} tableAlias - Alias de tabla alumno (ej: 'alu')
 * @param {string} promoAlias - Alias de tabla promocion (ej: 'pro')
 * @returns {string} Expresión SQL para usar en SELECT
 */
const generarSQLDescuentoVigente = (tableAlias = 'alu', promoAlias = 'pro') => {
    return `
        CASE
            WHEN ${promoAlias}.duracion_meses IS NULL OR ${promoAlias}.duracion_meses = 0
                THEN ${promoAlias}.descuento
            WHEN ${tableAlias}.fecha_inicio_promo IS NULL
                THEN 0
            WHEN ((YEAR(CURDATE()) - YEAR(${tableAlias}.fecha_inicio_promo)) * 12 + (MONTH(CURDATE()) - MONTH(${tableAlias}.fecha_inicio_promo))) < ${promoAlias}.duracion_meses
                THEN ${promoAlias}.descuento
            ELSE 0
        END
    `.trim();
};

module.exports = {
    calcularMesesTranscurridos,
    calcularDescuentoVigente,
    calcularMensualidadReal,
    generarSQLDescuentoVigente
};
