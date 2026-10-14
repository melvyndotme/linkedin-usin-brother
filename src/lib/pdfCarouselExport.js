// Multi-Slide Carousel PDF Generator for LinkedIn & Buffer
// Uses jsPDF to render each slide canvas into a LinkedIn document (PDF)

import { jsPDF } from 'jspdf';
import { renderSlideToCanvas } from './imageTemplateEngine.js';

/**
 * Renders all slides in a carousel series and compiles them into a multi-page PDF document.
 * 
 * @param {Object} options
 * @param {Array} options.slides - Array of slide objects (5 slides)
 * @param {Object} options.slidePhotos - Map of slide index -> photo URL
 * @param {Object} options.customSlideText - Map of slide index -> text overrides
 * @param {string} options.aspectRatio - '1:1' (Square 1080x1080) or '1.91:1' (Banner 1200x627)
 * @returns {Promise<{ pdfBlob: Blob, pdfBase64: string, dataUri: string }>}
 */
export async function generateCarouselPdf({
  slides = [],
  slidePhotos = {},
  customSlideText = {},
  aspectRatio = '1:1',
  overlayMode = 'minimal'
}) {
  if (!slides || slides.length === 0) {
    throw new Error('No slides available to generate carousel PDF.');
  }

  // 1:1 format: 1080x1080 pt, 1.91:1 format: 1200x627 pt
  const isBanner = aspectRatio === '1.91:1';
  const width = isBanner ? 1200 : 1080;
  const height = isBanner ? 627 : 1080;
  const orientation = isBanner ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation,
    unit: 'pt',
    format: [width, height],
    compress: true
  });

  for (let i = 0; i < slides.length; i++) {
    const base = slides[i];
    const overrides = customSlideText[i] || {};
    const slide = { ...base, ...overrides };
    const photoUrl = slidePhotos[i] || slide.defaultPhotoUrl;

    // Render high-fidelity canvas slide
    const slideDataUrl = await renderSlideToCanvas({
      slide,
      photoUrl,
      aspectRatio,
      overlayMode
    });

    if (i > 0) {
      pdf.addPage([width, height], orientation);
    }

    pdf.addImage(slideDataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST');
  }

  const pdfBlob = pdf.output('blob');
  const pdfBase64 = pdf.output('datauristring');

  return {
    pdf,
    pdfBlob,
    pdfBase64,
    filename: `brother-sg-carousel-${Date.now()}.pdf`
  };
}
