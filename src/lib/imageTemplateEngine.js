// High-Fidelity Image & Multi-Slide Carousel Template Engine for Brother Singapore
// Provides official Brother SG media assets, curated photography, 5-slide narrative series generation, and Canvas PNG export

// Official Brother Singapore Media Library (Provided from brother.com.sg)
export const OFFICIAL_BROTHER_ASSETS = [
  {
    id: 'bsg-biz',
    title: 'Business Solutions & Enterprise Hardware',
    category: 'business',
    url: 'https://www.brother.com.sg/-/media/ap2/global/business-solutions/landing/category-landing-page/frame-65.png?h=380&iar=0&w=648&rev=9d1e94ea036143f59035cad12b64a9ab',
    thumb: 'https://www.brother.com.sg/-/media/ap2/global/business-solutions/landing/category-landing-page/frame-65.png?h=380&iar=0&w=648&rev=9d1e94ea036143f59035cad12b64a9ab'
  },
  {
    id: 'bsg-scan',
    title: 'High-Speed Document Scanners',
    category: 'scanners',
    url: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/scanners/offerzone/bigbanner.jpg?rev=46a0f54713e7432397264b97fbbfff34',
    thumb: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/scanners/offerzone/bigbanner.jpg?rev=46a0f54713e7432397264b97fbbfff34'
  },
  {
    id: 'bsg-pt-p300bt',
    title: 'P-Touch P300BT Smart Cube Label Maker',
    category: 'labelling',
    url: 'https://www.brother.com.sg/-/media/ap2/common/listingpagebanners/pt-p300bt.png?rev=ca1441d94189455fbed6014406a602c9',
    thumb: 'https://www.brother.com.sg/-/media/ap2/common/listingpagebanners/pt-p300bt.png?rev=ca1441d94189455fbed6014406a602c9'
  },
  {
    id: 'bsg-pt-p710bt',
    title: 'P-Touch P710BT Cube Plus Label Printer',
    category: 'labelling',
    url: 'https://www.brother.com.sg/-/media/ap2/common/listingpagebanners/pt-p710bt.png?rev=03cff90f4bc24e35b9db7e7f5c87e290',
    thumb: 'https://www.brother.com.sg/-/media/ap2/common/listingpagebanners/pt-p710bt.png?rev=03cff90f4bc24e35b9db7e7f5c87e290'
  },
  {
    id: 'bsg-pt-e850tkw',
    title: 'P-Touch E850TKW Industrial Tube & Label System',
    category: 'labelling',
    url: 'https://www.brother.com.sg/-/media/ap2/common/listingpagebanners/pt-e850tkw.png?rev=ae2799e5fa5642e2a21913afa5884a6e',
    thumb: 'https://www.brother.com.sg/-/media/ap2/common/listingpagebanners/pt-e850tkw.png?rev=ae2799e5fa5642e2a21913afa5884a6e'
  },
  {
    id: 'bsg-label-new',
    title: 'Brother Singapore Labelling Solutions',
    category: 'labelling',
    url: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/labellingmachines/offerzone/new-banner.jpeg?rev=fac1d04d76f349b5858ff07e64ec1709',
    thumb: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/labellingmachines/offerzone/new-banner.jpeg?rev=fac1d04d76f349b5858ff07e64ec1709'
  },
  {
    id: 'bsg-label-assets',
    title: 'Asset Management & Commercial Labelling',
    category: 'labelling',
    url: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/labellingmachines/offerzone/assets-banner.jpg?rev=32f0b81b8b574d3cad8532dc74ab65bd',
    thumb: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/labellingmachines/offerzone/assets-banner.jpg?rev=32f0b81b8b574d3cad8532dc74ab65bd'
  },
  {
    id: 'bsg-label-sm',
    title: 'Everyday Portable Label Printers',
    category: 'labelling',
    url: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/labellingmachines/offerzone/smbanner1.jpg?rev=ded6b27be7344adc871612c9fef10af8',
    thumb: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/labellingmachines/offerzone/smbanner1.jpg?rev=ded6b27be7344adc871612c9fef10af8'
  },
  {
    id: 'bsg-sew-art',
    title: 'Sewing & Craft Embroidery Artwork',
    category: 'craft',
    url: 'https://www.brother.com.sg/-/media/ap2/singapore/toppage/offer-zone/1-3/brother-sewing-and-embroidery-artwork_750x250.webp?rev=4a717f8a62624d7bbe4102bd4479aed8',
    thumb: 'https://www.brother.com.sg/-/media/ap2/singapore/toppage/offer-zone/1-3/brother-sewing-and-embroidery-artwork_750x250.webp?rev=4a717f8a62624d7bbe4102bd4479aed8'
  },
  {
    id: 'bsg-sew-home',
    title: 'Home Sewing Machine Studio',
    category: 'craft',
    url: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/homesewingmachine/offerzone/singapore_sewing-banner-component.webp?rev=367d6715fbf446b28770887af888f6e1',
    thumb: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/homesewingmachine/offerzone/singapore_sewing-banner-component.webp?rev=367d6715fbf446b28770887af888f6e1'
  },
  {
    id: 'bsg-artspira',
    title: 'Artspira Digital Crafting App & Design',
    category: 'craft',
    url: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/homesewingmachine/offerzone/artspira_header_comp_750x250.webp?rev=14cc3b25bca74b1f9015f799225f9a52',
    thumb: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/homesewingmachine/offerzone/artspira_header_comp_750x250.webp?rev=14cc3b25bca74b1f9015f799225f9a52'
  },
  {
    id: 'bsg-sew-promo',
    title: 'Precision Sewing & Quilting Series',
    category: 'craft',
    url: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/homesewingmachine/offerzone/singapore_sewing-promo-banner-1.webp?rev=eac26ab883084e319d4e86e07a930e43',
    thumb: 'https://www.brother.com.sg/-/media/ap2/singapore/hubpage/homesewingmachine/offerzone/singapore_sewing-promo-banner-1.webp?rev=eac26ab883084e319d4e86e07a930e43'
  }
];

export const CURATED_EVENT_PHOTOS = {
  'mid-autumn': [
    {
      id: 'ma-1',
      title: 'Warm Lantern Celebration',
      url: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'ma-2',
      title: 'Traditional Mooncake & Tea',
      url: 'https://images.unsplash.com/photo-1599818817300-3fb3a4d0cb52?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1599818817300-3fb3a4d0cb52?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'ma-3',
      title: 'Full Moon Night Lights',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=70'
    }
  ],
  'national-day': [
    {
      id: 'nd-1',
      title: 'Marina Bay Skyline Fireworks',
      url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'nd-2',
      title: 'Singapore Cityscape Sunset',
      url: 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=400&q=70'
    }
  ],
  'deepavali': [
    {
      id: 'dp-1',
      title: 'Glowing Oil Lamps (Diyas)',
      url: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'dp-2',
      title: 'Festive Lights & Warm Glow',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=70'
    }
  ],
  'christmas': [
    {
      id: 'xm-1',
      title: 'Festive Holiday Lights & Desk',
      url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'xm-2',
      title: 'Warm Seasonal Workspace',
      url: 'https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=400&q=70'
    }
  ],
  'cny': [
    {
      id: 'cny-1',
      title: 'Spring Festival Red Lanterns',
      url: 'https://images.unsplash.com/photo-1548625361-12501a1c97a8?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1548625361-12501a1c97a8?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'cny-2',
      title: 'Festive Mandarins & Gold Ornaments',
      url: 'https://images.unsplash.com/photo-1517867065802-2204d30bd72b?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1517867065802-2204d30bd72b?auto=format&fit=crop&w=400&q=70'
    }
  ],
  'sustainability': [
    {
      id: 'sus-1',
      title: 'Lush Urban Greenery & Sunshine',
      url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'sus-2',
      title: 'Eco Clean Office Workspace',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=70'
    }
  ],
  'promotion': [
    {
      id: 'pro-1',
      title: 'Modern Executive Workspace',
      url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'pro-2',
      title: 'Creative Studio Architecture',
      url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=70'
    }
  ],
  'corporate': [
    {
      id: 'cor-1',
      title: 'Modern Collaborative Workplace',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'cor-2',
      title: 'High-Tech Singapore Skyline',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=70'
    }
  ]
};

// Map occasion to default photo category
export function getPhotoCategoryForOccasion(occasion) {
  if (!occasion) return 'corporate';
  const name = (occasion.name || '').toLowerCase();
  const id = (occasion.id || '').toLowerCase();

  if (name.includes('autumn') || id.includes('autumn') || name.includes('中秋')) return 'mid-autumn';
  if (name.includes('national') || id.includes('national') || name.includes('ndp')) return 'national-day';
  if (name.includes('deepavali') || id.includes('deepavali') || name.includes('diwali')) return 'deepavali';
  if (name.includes('christmas') || id.includes('christmas') || name.includes('xmas')) return 'christmas';
  if (name.includes('cny') || name.includes('chinese new year') || name.includes('lunar')) return 'cny';
  if (occasion.eventType === 'sustainability' || occasion.theme === 'green' || name.includes('eco') || name.includes('waste')) return 'sustainability';
  if (occasion.eventType === 'promotion' || occasion.theme === 'red' || name.includes('trade-in') || name.includes('promo')) return 'promotion';

  return 'corporate';
}

/**
 * Generate 5-Slide Narrative Series for an Occasion
 */
export function generateCarouselSlideSeries(occasion, activeDraft = null) {
  const occasionName = occasion?.name || 'Brother Singapore Special';
  const category = occasion?.category || 'Corporate Celebration';
  const badge = occasion?.badgeText || 'Special Highlight';
  const subtitle = occasion?.subtitle || 'Standing "At your side" across Singapore';
  const hashtags = (occasion?.suggestedHashtags || ['#BrotherSingapore', '#AtYourSide']).slice(0, 3).join(' ');

  const draftAngle = activeDraft?.name || 'Community & Workplace Harmony';

  return [
    {
      slideIndex: 1,
      slideNumber: '01 / 05',
      type: 'cover',
      roleTitle: 'Cover Hook',
      badge: badge,
      headline: occasionName,
      subheadline: draftAngle,
      supportingText: subtitle,
      footerText: 'Swipe to explore our story ➔',
      theme: occasion?.theme || 'blue'
    },
    {
      slideIndex: 2,
      slideNumber: '02 / 05',
      type: 'insight',
      roleTitle: 'Tradition & Meaning',
      badge: 'The Tradition & Spirit',
      headline: 'Honoring Shared Roots',
      subheadline: 'More than a calendar event, it is a moment to pause, reflect, and renew the bonds that anchor our community.',
      supportingText: 'From shared tea and conversations to the values of mutual respect (Wa), true progress is rooted in meaningful human connection.',
      footerText: 'Brother Singapore • Cultural Heritage',
      theme: occasion?.theme || 'blue'
    },
    {
      slideIndex: 3,
      slideNumber: '03 / 05',
      type: 'philosophy',
      roleTitle: "Brother 'At Your Side'",
      badge: 'At Your Side',
      headline: 'Empowering Every Milestone',
      subheadline: '"To stand at your side means walking together through every challenge, season, and shared celebration."',
      supportingText: 'Brother Singapore celebrates our clients, enterprise partners, and team members who build the future of Singapore every single day.',
      footerText: 'Brother Singapore • Brand Commitment',
      theme: occasion?.theme || 'blue'
    },
    {
      slideIndex: 4,
      slideNumber: '04 / 05',
      type: 'action',
      roleTitle: 'Craft & Precision',
      badge: 'Workplace Reliability',
      headline: 'Precision in Every Detail',
      subheadline: 'Crafting festive packages, essential office documents, or durable labeling with Japanese Kaizen standards.',
      supportingText: 'When technology works seamlessly in the background, you are free to focus on what matters most: celebrating and growing together.',
      footerText: 'Brother Hardware & Document Solutions',
      theme: occasion?.theme || 'blue'
    },
    {
      slideIndex: 5,
      slideNumber: '05 / 05',
      type: 'cta',
      roleTitle: 'Community Engagement',
      badge: 'Join The Conversation',
      headline: 'How Is Your Team Celebrating?',
      subheadline: 'What is your favorite tradition, family gathering, or workplace moment during this festive period?',
      supportingText: `Share your thoughts with our community in the comments below! 👇\n${hashtags}`,
      footerText: 'brother.com.sg • At your side',
      theme: occasion?.theme || 'blue'
    }
  ];
}

/**
 * Render a Slide onto an HTML5 Canvas for high-DPI export with Official Brother Logo
 */
export async function renderSlideToCanvas({
  slide,
  photoUrl,
  aspectRatio = '1:1'
}) {
  const isBanner = aspectRatio === '1.91:1';
  const width = isBanner ? 1200 : 1080;
  const height = isBanner ? 627 : 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Load Background Image
  let imgLoaded = false;
  let bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';

  const loadImage = (src) => new Promise((resolve) => {
    bgImg.onload = () => { imgLoaded = true; resolve(); };
    bgImg.onerror = () => { imgLoaded = false; resolve(); };
    bgImg.src = src;
  });

  if (photoUrl) {
    const isRemote = photoUrl.startsWith('http://') || photoUrl.startsWith('https://');
    const safeUrl = isRemote ? `/api/image-proxy?url=${encodeURIComponent(photoUrl)}` : photoUrl;
    await loadImage(safeUrl);
  }

  // Draw background (or solid fallback)
  if (imgLoaded && bgImg.width > 0) {
    const hRatio = width / bgImg.width;
    const vRatio = height / bgImg.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShiftX = (width - bgImg.width * ratio) / 2;
    const centerShiftY = (height - bgImg.height * ratio) / 2;
    ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height, centerShiftX, centerShiftY, bgImg.width * ratio, bgImg.height * ratio);
  } else {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#06102B');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Cinematic Gradient Overlays for High Legibility
  const scrim = ctx.createLinearGradient(0, 0, width, height);
  if (isBanner) {
    scrim.addColorStop(0, 'rgba(3, 8, 28, 0.92)');
    scrim.addColorStop(0.55, 'rgba(6, 16, 43, 0.82)');
    scrim.addColorStop(1, 'rgba(4, 10, 25, 0.45)');
  } else {
    scrim.addColorStop(0, 'rgba(4, 10, 25, 0.65)');
    scrim.addColorStop(0.4, 'rgba(6, 16, 43, 0.88)');
    scrim.addColorStop(1, 'rgba(3, 7, 18, 0.96)');
  }
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, width, height);

  // Signature Brother Blue Accent Bar on top or left
  ctx.fillStyle = '#0f2ea2';
  if (isBanner) {
    ctx.fillRect(0, 0, 8, height);
  } else {
    ctx.fillRect(0, 0, width, 8);
  }

  // 3. Top Header: Official Brother Logo & Slide Number
  let logoLoaded = false;
  const logoImg = new Image();
  logoImg.crossOrigin = 'anonymous';

  const loadLogo = (src) => new Promise((resolve) => {
    logoImg.onload = () => { logoLoaded = true; resolve(); };
    logoImg.onerror = () => { logoLoaded = false; resolve(); };
    logoImg.src = src;
  });

  await loadLogo('/brother-logo.svg');
  if (!logoLoaded) {
    await loadLogo('/brother-logo.png');
  }

  if (logoLoaded && logoImg.width > 0) {
    const logoH = isBanner ? 34 : 40;
    const logoW = (logoImg.width / logoImg.height) * logoH;
    ctx.drawImage(logoImg, 70, isBanner ? 48 : 65, logoW, logoH);
  } else {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('brother', 70, isBanner ? 65 : 85);
    ctx.font = 'italic 500 13px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('at your side', 72, isBanner ? 83 : 103);
    ctx.restore();
  }

  // Slide Numbering (e.g. 01 / 05)
  if (slide?.slideNumber) {
    ctx.save();
    ctx.font = 'bold 15px "Plus Jakarta Sans", monospace';
    ctx.fillStyle = '#38BDF8';
    ctx.textAlign = 'right';
    ctx.fillText(slide.slideNumber, width - 70, isBanner ? 70 : 90);
    ctx.restore();
  }

  // 4. Badge Pill (e.g. "Festivals & Celebrations")
  if (slide?.badge) {
    const badgeY = isBanner ? 130 : 170;
    ctx.save();
    ctx.font = 'bold 12px "Plus Jakarta Sans", system-ui, sans-serif';
    const textWidth = ctx.measureText(slide.badge.toUpperCase()).width;
    const pillWidth = textWidth + 28;
    const pillHeight = 28;

    ctx.fillStyle = '#0f2ea2';
    ctx.beginPath();
    ctx.roundRect(70, badgeY, pillWidth, pillHeight, 6);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(slide.badge.toUpperCase(), 84, badgeY + 19);
    ctx.restore();
  }

  // 5. Main Headline
  const headlineY = isBanner ? 210 : 270;
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = isBanner 
    ? 'bold 44px "Plus Jakarta Sans", system-ui, sans-serif'
    : 'bold 50px "Plus Jakarta Sans", system-ui, sans-serif';

  const maxLineWidth = width - 140;
  wrapText(ctx, slide?.headline || '', 70, headlineY, maxLineWidth, isBanner ? 50 : 58);
  ctx.restore();

  // 6. Subheadline / Core Narrative
  const subY = isBanner ? 310 : 430;
  ctx.save();
  ctx.fillStyle = '#E2E8F0';
  ctx.font = isBanner 
    ? '500 20px "Plus Jakarta Sans", system-ui, sans-serif'
    : '500 23px "Plus Jakarta Sans", system-ui, sans-serif';
  wrapText(ctx, slide?.subheadline || '', 70, subY, maxLineWidth, 32);
  ctx.restore();

  // 7. Supporting Text / Quote / Details
  if (slide?.supportingText) {
    const suppY = isBanner ? 420 : 610;
    ctx.save();
    ctx.fillStyle = '#94A3B8';
    ctx.font = '400 17px "Plus Jakarta Sans", system-ui, sans-serif';
    wrapText(ctx, slide.supportingText, 70, suppY, maxLineWidth, 26);
    ctx.restore();
  }

  // 8. Bottom Footer & Official Channel Watermark
  ctx.save();
  const footerY = height - 50;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, footerY - 20);
  ctx.lineTo(width - 70, footerY - 20);
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '500 13px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(slide?.footerText || 'Brother Singapore • At your side', 70, footerY + 5);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#0284C7';
  ctx.fillText('brother.com.sg', width - 70, footerY + 5);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
