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
    },
    {
      id: 'ma-4',
      title: 'Glowing Festival Lanterns',
      url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'ma-5',
      title: 'Evening Festive Gathering',
      url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=70'
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
    },
    {
      id: 'nd-3',
      title: 'Gardens by the Bay Supertrees',
      url: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'nd-4',
      title: 'Modern Singapore Central Business District',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'nd-5',
      title: 'Vibrant City Lights & Unity',
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=70'
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
    },
    {
      id: 'dp-3',
      title: 'Intricate Rangoli Art & Petals',
      url: 'https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'dp-4',
      title: 'Festive Celebration & Sparkling Lights',
      url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'dp-5',
      title: 'Warm Evening Lamps & Community Feast',
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=70'
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
    },
    {
      id: 'xm-3',
      title: 'Glowing Holiday Ornaments & Evergreen',
      url: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'xm-4',
      title: 'Festive Gift Crafting & Precision Wrapping',
      url: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'xm-5',
      title: 'Celebratory Team Toasts & Community',
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=70'
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
    },
    {
      id: 'cny-3',
      title: 'Traditional Lunar New Year Street',
      url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'cny-4',
      title: 'Festive Red & Gold Prosperity Decor',
      url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'cny-5',
      title: 'Warm Spring Celebration & Tea',
      url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=70'
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
    },
    {
      id: 'sus-3',
      title: 'Clean Sustainable Energy & Solar',
      url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'sus-4',
      title: 'Green Architecture & Living Walls',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'sus-5',
      title: 'Eco Stewardship & Community Action',
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=70'
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
    },
    {
      id: 'pro-3',
      title: 'High Performance Business Operations',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'pro-4',
      title: 'Strategic B2B Partnership Discussion',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'pro-5',
      title: 'Enterprise Workspace Precision',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=70'
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
    },
    {
      id: 'cor-3',
      title: 'Executive Mentorship & Strategy Discussion',
      url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'cor-4',
      title: 'Focused Innovation & Digital Workspace',
      url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=70'
    },
    {
      id: 'cor-5',
      title: 'Inclusive Team Camaraderie & Pantry',
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=85',
      thumb: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=70'
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
 * Returns a 5-image curated sequence tailored for the occasion category
 * Combines atmospheric occasion hero, people/culture, team collaboration, official Brother hardware, and community discussion
 */
export function getDefaultPhotoSequence(photoCategory, occasion) {
  const categoryPhotos = CURATED_EVENT_PHOTOS[photoCategory] || CURATED_EVENT_PHOTOS['corporate'];
  const corpPhotos = CURATED_EVENT_PHOTOS['corporate'];
  const brotherHardware = OFFICIAL_BROTHER_ASSETS[0]?.url; // Business Solutions & Enterprise Hardware
  const brotherScanner = OFFICIAL_BROTHER_ASSETS[1]?.url || brotherHardware;

  if (photoCategory === 'corporate' || photoCategory === 'promotion') {
    return [
      categoryPhotos[1]?.url || categoryPhotos[0]?.url, // Skyline / Hero
      categoryPhotos[3]?.url || categoryPhotos[0]?.url, // Workspace
      categoryPhotos[2]?.url || corpPhotos[2]?.url,     // Mentorship / Team
      brotherHardware,                                  // Official Hardware
      categoryPhotos[0]?.url || corpPhotos[0]?.url      // Collaborative discussion
    ];
  }

  if (photoCategory === 'sustainability') {
    return [
      categoryPhotos[0]?.url, // Lush Greenery
      categoryPhotos[1]?.url, // Eco Office
      corpPhotos[0]?.url,     // Team Collaboration
      brotherHardware,        // Eco-efficient Hardware
      categoryPhotos[2]?.url || categoryPhotos[4]?.url  // Clean Energy
    ];
  }

  // Festive events (Deepavali, CNY, Mid-Autumn, Christmas, National Day)
  return [
    categoryPhotos[0]?.url || corpPhotos[0]?.url, // Slide 1: Occasion Hero (Diyas / Lanterns / Fireworks)
    categoryPhotos[1]?.url || categoryPhotos[2]?.url || corpPhotos[0]?.url, // Slide 2: Cultural warmth / lights
    corpPhotos[0]?.url,                          // Slide 3: Brother collaborative team / people
    brotherHardware,                             // Slide 4: Brother official hardware / solutions
    categoryPhotos[2]?.url || categoryPhotos[3]?.url || categoryPhotos[0]?.url // Slide 5: Community celebration / discussion
  ];
}

/**
 * Generate 5-Slide Narrative Series tailored specifically to the selected Angle & Template
 */
export function generateCarouselSlideSeries(occasion, activeDraft = null) {
  const occasionName = occasion?.name || 'Brother Singapore Special';
  const category = occasion?.category || 'Corporate Celebration';
  const badge = occasion?.badgeText || 'Special Highlight';
  const subtitle = occasion?.subtitle || 'Standing "At your side" across Singapore';
  const hashtags = (occasion?.suggestedHashtags || ['#BrotherSingapore', '#AtYourSide']).slice(0, 3).join(' ');

  const photoCat = getPhotoCategoryForOccasion(occasion);
  const photoSeq = getDefaultPhotoSequence(photoCat, occasion);

  // Identify active angle or template
  const tmplId = (activeDraft?.templateId || activeDraft?.id || '').toLowerCase();
  const draftName = (activeDraft?.name || activeDraft?.templateName || '').toLowerCase();
  const draftAngle = (activeDraft?.angle || activeDraft?.whyThisWorks || '').toLowerCase();

  // Helper to determine theme
  const theme = occasion?.theme || 'blue';

  // --- ANGLE 1: WARM COMMUNITY GREETING (Wa, Multiracial Unity, Cultural Warmth) ---
  if (
    tmplId.includes('warm_greeting') ||
    tmplId === 'draft-1' ||
    draftName.includes('warm community') ||
    draftName.includes('shared harmony') ||
    draftAngle.includes('community unity') ||
    draftAngle.includes('hofstede harmony')
  ) {
    return [
      {
        slideIndex: 1,
        slideNumber: '01 / 05',
        type: 'cover',
        roleTitle: 'Cover Hook',
        badge: 'Festive Greeting',
        headline: occasionName,
        subheadline: 'Warm Community Unity & Shared Harmony (Wa)',
        supportingText: 'Wishing our clients, enterprise partners, and friends across Singapore joyous celebrations.',
        footerText: 'Swipe to explore our festive story ➔',
        theme,
        defaultPhotoUrl: photoSeq[0]
      },
      {
        slideIndex: 2,
        slideNumber: '02 / 05',
        type: 'insight',
        roleTitle: 'Tradition & Spirit',
        badge: 'Shared Heritage',
        headline: 'Honoring Light, Hope & Unity',
        subheadline: 'More than a calendar milestone, it is a moment to celebrate what connects us all.',
        supportingText: 'From shared delicacies and family visits to the enduring warmth of neighborly goodwill, Singapore\'s multiracial harmony remains our greatest strength.',
        footerText: 'Brother Singapore • Cultural Heritage & Harmony',
        theme,
        defaultPhotoUrl: photoSeq[1]
      },
      {
        slideIndex: 3,
        slideNumber: '03 / 05',
        type: 'philosophy',
        roleTitle: "Brother 'At Your Side'",
        badge: 'At Your Side',
        headline: 'Standing Beside Our Community',
        subheadline: '"Our promise to be \'At your side\' extends far beyond workplace technology."',
        supportingText: 'It is about honoring the rich cultural tapestry that makes Singapore resilient, united, and vibrant through every season.',
        footerText: 'Brother Singapore • Brand Commitment',
        theme,
        defaultPhotoUrl: photoSeq[2]
      },
      {
        slideIndex: 4,
        slideNumber: '04 / 05',
        type: 'action',
        roleTitle: 'Everyday Workplaces',
        badge: 'Empowering Workplaces',
        headline: 'Fostering Meaningful Connections',
        subheadline: 'Supporting the businesses, schools, and families who celebrate this special season.',
        supportingText: 'Whether printing greeting cards, creating festive labels, or keeping offices running smoothly, we take pride in supporting your daily moments.',
        footerText: 'Brother Document & Print Solutions',
        theme,
        defaultPhotoUrl: photoSeq[3]
      },
      {
        slideIndex: 5,
        slideNumber: '05 / 05',
        type: 'cta',
        roleTitle: 'Community Engagement',
        badge: 'Join The Conversation',
        headline: 'How Are You Celebrating?',
        subheadline: 'What is your favorite festive tradition, family gathering, or workplace moment during this period?',
        supportingText: `Share your thoughts with our community in the comments below! 👇\n${hashtags}`,
        footerText: 'brother.com.sg • At your side',
        theme,
        defaultPhotoUrl: photoSeq[4]
      }
    ];
  }

  // --- ANGLE 2: VALUES, KAIZEN & CRAFTSMANSHIP ---
  if (
    tmplId.includes('reflection_values') ||
    tmplId === 'draft-2' ||
    draftName.includes('craftsmanship') ||
    draftName.includes('kaizen') ||
    draftName.includes('values & heritage') ||
    draftAngle.includes('cultural craftsmanship')
  ) {
    return [
      {
        slideIndex: 1,
        slideNumber: '01 / 05',
        type: 'cover',
        roleTitle: 'Strategic Cover',
        badge: 'Values & Heritage',
        headline: occasionName,
        subheadline: 'Craftsmanship, Kaizen & Long-Term Purpose',
        supportingText: 'Reflecting on the enduring foundations that anchor meaningful growth and collective trust.',
        footerText: 'Swipe to explore our reflection ➔',
        theme,
        defaultPhotoUrl: photoSeq[0]
      },
      {
        slideIndex: 2,
        slideNumber: '02 / 05',
        type: 'insight',
        roleTitle: 'Continuous Care',
        badge: 'Japanese Kaizen',
        headline: 'The Spirit of Continuous Care',
        subheadline: 'True progress isn\'t just about moving fast — it is about honoring strong foundations.',
        supportingText: 'In both life and business, enduring success is built through steady care, continuous improvement (Kaizen), and unwavering attention to detail.',
        footerText: 'Brother Singapore • Heritage & Excellence',
        theme,
        defaultPhotoUrl: photoSeq[1]
      },
      {
        slideIndex: 3,
        slideNumber: '03 / 05',
        type: 'philosophy',
        roleTitle: 'Sustainable Foundations',
        badge: 'Long-Term Vision',
        headline: 'People & Sustainability at the Core',
        subheadline: '"Putting people, trust, and sustainable progress at the heart of everything we create."',
        supportingText: 'As we celebrate, Brother Singapore reaffirms our commitment to walking alongside local businesses and nurturing long-term relationships that stand the test of time.',
        footerText: 'Brother Singapore • Corporate Responsibility',
        theme,
        defaultPhotoUrl: photoSeq[2]
      },
      {
        slideIndex: 4,
        slideNumber: '04 / 05',
        type: 'action',
        roleTitle: 'Craft & Precision',
        badge: 'Workplace Reliability',
        headline: 'Precision in Every Detail',
        subheadline: 'Crafting essential office workflows, durable labeling, and reliable printing with Japanese Kaizen standards.',
        supportingText: 'When technology works seamlessly in the background, you are free to focus on what matters most: celebrating and growing together.',
        footerText: 'Brother Hardware & Document Solutions',
        theme,
        defaultPhotoUrl: photoSeq[3]
      },
      {
        slideIndex: 5,
        slideNumber: '05 / 05',
        type: 'cta',
        roleTitle: 'Strategic Discussion',
        badge: 'Leadership Reflection',
        headline: 'What Values Anchor Your Team?',
        subheadline: 'How does your organization balance modern operational speed with long-term trust and precision?',
        supportingText: `Join the conversation on building resilient foundations for the years ahead. 👇\n${hashtags}`,
        footerText: 'brother.com.sg • At your side for the road ahead',
        theme,
        defaultPhotoUrl: photoSeq[4]
      }
    ];
  }

  // --- ANGLE 3: INTERNAL TEAM & CULTURE SPOTLIGHT ---
  if (
    tmplId.includes('team_spotlight') ||
    tmplId === 'draft-3' ||
    draftName.includes('team culture') ||
    draftName.includes('team & culture') ||
    draftName.includes('behind-the-scenes') ||
    draftAngle.includes('people-first')
  ) {
    return [
      {
        slideIndex: 1,
        slideNumber: '01 / 05',
        type: 'cover',
        roleTitle: 'Culture Cover',
        badge: 'Life At Brother',
        headline: occasionName,
        subheadline: 'Festive Energy & Team Culture Behind the Scenes',
        supportingText: 'Peeking inside our Singapore family as we celebrate together with warmth and pride.',
        footerText: 'Swipe to see life behind the scenes ➔',
        theme,
        defaultPhotoUrl: photoSeq[0]
      },
      {
        slideIndex: 2,
        slideNumber: '02 / 05',
        type: 'insight',
        roleTitle: 'Pantry Moments',
        badge: 'Office Festivities',
        headline: 'Pantry Delicacies & Shared Smiles',
        subheadline: 'The festive energy is palpable across our Brother Singapore office.',
        supportingText: 'From sharing traditional festive treats in the pantry to exchanging stories and well-wishes, cultural celebrations bring out our team\'s warmest camaraderie.',
        footerText: 'Brother Singapore • Team Camaraderie',
        theme,
        defaultPhotoUrl: photoSeq[1]
      },
      {
        slideIndex: 3,
        slideNumber: '03 / 05',
        type: 'philosophy',
        roleTitle: 'People-First Culture',
        badge: 'Inclusive Workplace',
        headline: 'Diverse Traditions, One Team',
        subheadline: '"Our greatest strength is the passionate, diverse people behind our brand."',
        supportingText: 'Creating an inclusive environment where every culture is celebrated allows our people to bring their authentic selves to work every single day.',
        footerText: 'Brother Singapore • Employer Branding',
        theme,
        defaultPhotoUrl: photoSeq[2]
      },
      {
        slideIndex: 4,
        slideNumber: '04 / 05',
        type: 'action',
        roleTitle: 'Frontline Dedication',
        badge: 'Service Heroes',
        headline: 'Powered by Passionate People',
        subheadline: 'From customer service specialists to technical engineers standing beside your business daily.',
        supportingText: 'Behind every reliable machine and enterprise solution is a dedicated Singapore team working with care to keep your operations moving forward.',
        footerText: 'Brother Singapore • Service & Support Team',
        theme,
        defaultPhotoUrl: photoSeq[3]
      },
      {
        slideIndex: 5,
        slideNumber: '05 / 05',
        type: 'cta',
        roleTitle: 'Workplace Community',
        badge: 'Team Engagement',
        headline: 'How Is Your Workplace Celebrating?',
        subheadline: 'Does your team have a favorite pantry snack, tradition, or festive ritual this week?',
        supportingText: `Share your team\'s festivities and shout out your colleagues in the comments! 🇸🇬\n${hashtags} #LifeAtBrother #PeopleFirst`,
        footerText: 'brother.com.sg • Join our growing team',
        theme,
        defaultPhotoUrl: photoSeq[4]
      }
    ];
  }

  // --- AI THOUGHT LEADERSHIP (3-Pillar Breakdown) ---
  if (tmplId.includes('3pillar') || draftName.includes('3-pillar')) {
    return [
      {
        slideIndex: 1,
        slideNumber: '01 / 05',
        type: 'cover',
        roleTitle: 'Executive Hook',
        badge: 'Executive Synthesis',
        headline: occasionName,
        subheadline: '3-Pillar Breakthrough Breakdown',
        supportingText: 'Cutting through the noise: What it is, why it matters, and the tangible impact for Singapore enterprise.',
        footerText: 'Swipe to explore the executive synthesis ➔',
        theme,
        defaultPhotoUrl: photoSeq[0]
      },
      {
        slideIndex: 2,
        slideNumber: '02 / 05',
        type: 'insight',
        roleTitle: 'Pillar 01: What It Is',
        badge: '01 | What It Is',
        headline: 'The Technology Breakthrough',
        subheadline: 'Frontier AI models moving from experimentation into deterministic daily workflows.',
        supportingText: 'Automating high-frequency administrative friction so knowledge workers can focus on high-judgment, creative problem solving.',
        footerText: 'Brother Singapore • Tech Intelligence',
        theme,
        defaultPhotoUrl: photoSeq[1]
      },
      {
        slideIndex: 3,
        slideNumber: '03 / 05',
        type: 'insight',
        roleTitle: 'Pillar 02: Why It Matters',
        badge: '02 | Why It Matters',
        headline: 'The Macro Enterprise Shift',
        subheadline: 'Operational velocity is becoming the true differentiator for modern enterprises.',
        supportingText: 'Organizations that proactively redesign workflows around intelligent automation outpace peers in agility, cost-efficiency, and employee retention.',
        footerText: 'Brother Singapore • Strategic Insights',
        theme,
        defaultPhotoUrl: photoSeq[2]
      },
      {
        slideIndex: 4,
        slideNumber: '04 / 05',
        type: 'action',
        roleTitle: 'Pillar 03: Brother Impact',
        badge: '03 | Practical Impact',
        headline: 'Turning Tools into Superpowers',
        subheadline: 'Under our Brother Xplorer framework, we bridge digital intelligence with physical workplace reliability.',
        supportingText: 'Equipping our employees and enterprise clients with integrated hardware and software solutions that eliminate routine drag.',
        footerText: 'Brother Solutions • Future of Work',
        theme,
        defaultPhotoUrl: photoSeq[3]
      },
      {
        slideIndex: 5,
        slideNumber: '05 / 05',
        type: 'cta',
        roleTitle: 'Executive Discussion',
        badge: 'Leadership Question',
        headline: 'How Is Your Team Exploring AI?',
        subheadline: 'Where is your organization finding the most practical, high-ROI workflow wins today?',
        supportingText: `Join the discussion with enterprise peers in the comments below! 👇\n${hashtags}`,
        footerText: 'brother.com.sg • Empowering smart workplaces',
        theme,
        defaultPhotoUrl: photoSeq[4]
      }
    ];
  }

  // --- EMPLOYER BRANDING: WORKPLACE FLEXIBILITY & FAMILY WELLBEING ---
  if (tmplId.includes('flexibility') || draftName.includes('flexibility')) {
    return [
      {
        slideIndex: 1,
        slideNumber: '01 / 05',
        type: 'cover',
        roleTitle: 'Culture Cover',
        badge: 'Employer Branding',
        headline: 'Workplace Flexibility & Wellbeing',
        subheadline: 'Fostering High Trust Over Face-Time Policing',
        supportingText: 'How sustainable work-life integration powers multi-year team loyalty and consistent excellence.',
        footerText: 'Swipe to see how we work ➔',
        theme,
        defaultPhotoUrl: photoSeq[0]
      },
      {
        slideIndex: 2,
        slideNumber: '02 / 05',
        type: 'insight',
        roleTitle: 'High-Trust Culture',
        badge: 'Managerial Trust',
        headline: 'Autonomy Powers Performance',
        subheadline: 'Modern professionals in Singapore thrive when leadership values outcomes over physical desk presence.',
        supportingText: 'Flexible work isn\'t about doing less — it is about empowering responsible self-management and preserving family harmony.',
        footerText: 'Brother Singapore • Culture of Trust',
        theme,
        defaultPhotoUrl: photoSeq[1]
      },
      {
        slideIndex: 3,
        slideNumber: '03 / 05',
        type: 'philosophy',
        roleTitle: 'Flexible Fridays',
        badge: 'Concrete Policies',
        headline: 'Protected Time for What Matters',
        subheadline: 'Year-round Flexible Fridays, protected focus blocks, and smooth weekend transitions.',
        supportingText: 'Whether picking up children on time, pursuing professional courses, or enjoying uninterrupted creative focus, our policies support the whole person.',
        footerText: 'Brother Singapore • Employee Wellbeing',
        theme,
        defaultPhotoUrl: photoSeq[2]
      },
      {
        slideIndex: 4,
        slideNumber: '04 / 05',
        type: 'action',
        roleTitle: 'Hybrid Excellence',
        badge: 'Seamless Infrastructure',
        headline: 'Equipped for Any Workspace',
        subheadline: 'Durable Brother hardware and cloud print solutions supporting hybrid workflows across Singapore.',
        supportingText: 'Reliable document solutions ensure teams collaborate seamlessly whether in our office or working from home.',
        footerText: 'Brother Document & Hybrid Solutions',
        theme,
        defaultPhotoUrl: photoSeq[3]
      },
      {
        slideIndex: 5,
        slideNumber: '05 / 05',
        type: 'cta',
        roleTitle: 'HR Community',
        badge: 'Join The Discussion',
        headline: 'How Does Your Team Support Balance?',
        subheadline: 'What workplace policy has made the biggest positive difference to your personal wellbeing?',
        supportingText: `Share your experiences with our professional community below! 👇\n${hashtags} #LifeAtBrother`,
        footerText: 'brother.com.sg • Careers at Brother SG',
        theme,
        defaultPhotoUrl: photoSeq[4]
      }
    ];
  }

  // --- EMPLOYER BRANDING: EARLY CAREER & INTERNSHIPS ---
  if (tmplId.includes('early_career') || draftName.includes('early career') || draftName.includes('intern')) {
    return [
      {
        slideIndex: 1,
        slideNumber: '01 / 05',
        type: 'cover',
        roleTitle: 'Internship Hook',
        badge: 'Talent Acquisition',
        headline: 'Real Work & Real Ownership',
        subheadline: 'Early Career Mentorship at Brother Singapore',
        supportingText: 'Challenging the stereotype of passive entry-level training with hands-on enterprise impact.',
        footerText: 'Swipe to see our intern journey ➔',
        theme,
        defaultPhotoUrl: photoSeq[0]
      },
      {
        slideIndex: 2,
        slideNumber: '02 / 05',
        type: 'insight',
        roleTitle: 'Real Ownership',
        badge: 'Direct Impact',
        headline: 'Substantial Projects from Day One',
        subheadline: 'From B2B marketing initiatives to live technical deployments, our interns lead real business outcomes.',
        supportingText: 'No photocopying coffee runs. Every intern contributes directly to customer-facing projects and strategic operations.',
        footerText: 'Brother Singapore • Early Careers',
        theme,
        defaultPhotoUrl: photoSeq[1]
      },
      {
        slideIndex: 3,
        slideNumber: '03 / 05',
        type: 'philosophy',
        roleTitle: 'Senpai Mentorship',
        badge: 'Accessible Leadership',
        headline: 'Direct Guidance from Senior Leaders',
        subheadline: 'Bridging organizational hierarchy through the Japanese tradition of Senpai-Kohai mentorship.',
        supportingText: 'Senior managers provide weekly 1-on-1 coaching, career guidance, and technical masterclasses that accelerate lifelong career growth.',
        footerText: 'Brother Singapore • Mentorship & Growth',
        theme,
        defaultPhotoUrl: photoSeq[2]
      },
      {
        slideIndex: 4,
        slideNumber: '04 / 05',
        type: 'action',
        roleTitle: 'Continuous Kaizen',
        badge: 'Skills of Tomorrow',
        headline: 'Building Practical Superpowers',
        subheadline: 'Mastering modern digital tools, data synthesis, and enterprise client relations.',
        supportingText: 'We celebrate our interns\' curiosity and fresh perspectives, thanking them for enriching our office culture every single day.',
        footerText: 'Brother Singapore • Talent Community',
        theme,
        defaultPhotoUrl: photoSeq[3]
      },
      {
        slideIndex: 5,
        slideNumber: '05 / 05',
        type: 'cta',
        roleTitle: 'Application CTA',
        badge: 'Join Our Cohort',
        headline: 'Ready to Accelerate Your Career?',
        subheadline: 'Applications for our next internship and graduate intake are now open across Singapore.',
        supportingText: `Connect with our Talent Acquisition team or tag an ambitious student below! 👇\n${hashtags} #EarlyCareers #LifeAtBrother`,
        footerText: 'brother.com.sg/careers • Apply Today',
        theme,
        defaultPhotoUrl: photoSeq[4]
      }
    ];
  }

  // --- DEFAULT / DYNAMIC FALLBACK (Tailored from draft title and snippet) ---
  const dynamicTitle = activeDraft?.name || occasionName;
  const postSnippets = (activeDraft?.post || activeDraft?.postContent || '')
    .split('\n\n')
    .filter(p => p.trim().length > 20 && !p.startsWith('#'));

  const p1 = postSnippets[0] || 'Reflecting on what brings our community together — unity, care, and mutual respect.';
  const p2 = postSnippets[1] || 'Our promise to stand \'At your side\' goes beyond technology to uplift the people we serve.';
  const p3 = postSnippets[2] || 'Delivering precision hardware and digital solutions engineered to make everyday work seamless.';
  const p4 = postSnippets[3] || 'How is your organization moving forward? We’d love to hear your perspectives below.';

  return [
    {
      slideIndex: 1,
      slideNumber: '01 / 05',
      type: 'cover',
      roleTitle: 'Cover Hook',
      badge: badge,
      headline: dynamicTitle,
      subheadline: activeDraft?.name || 'Standing "At your side" across Singapore',
      supportingText: subtitle,
      footerText: 'Swipe to explore our story ➔',
      theme,
      defaultPhotoUrl: photoSeq[0]
    },
    {
      slideIndex: 2,
      slideNumber: '02 / 05',
      type: 'insight',
      roleTitle: 'Core Insight',
      badge: 'Key Perspective',
      headline: 'Foundations of Meaningful Progress',
      subheadline: p1.slice(0, 110) + (p1.length > 110 ? '...' : ''),
      supportingText: 'True progress isn\'t just about moving fast — it is about honoring strong foundations, fostering trust, and ensuring every step forward uplifts those around us.',
      footerText: 'Brother Singapore • Strategic Perspective',
      theme,
      defaultPhotoUrl: photoSeq[1]
    },
    {
      slideIndex: 3,
      slideNumber: '03 / 05',
      type: 'philosophy',
      roleTitle: "Brother 'At Your Side'",
      badge: 'Brand Commitment',
      headline: 'Empowering Every Milestone',
      subheadline: p2.slice(0, 110) + (p2.length > 110 ? '...' : ''),
      supportingText: 'Brother Singapore celebrates our clients, enterprise partners, and team members who build the future of Singapore every single day.',
      footerText: 'Brother Singapore • At your side',
      theme,
      defaultPhotoUrl: photoSeq[2]
    },
    {
      slideIndex: 4,
      slideNumber: '04 / 05',
      type: 'action',
      roleTitle: 'Craft & Precision',
      badge: 'Workplace Reliability',
      headline: 'Precision in Every Detail',
      subheadline: p3.slice(0, 110) + (p3.length > 110 ? '...' : ''),
      supportingText: 'When technology works seamlessly in the background with Japanese Kaizen standards, you are free to focus on what matters most.',
      footerText: 'Brother Hardware & Document Solutions',
      theme,
      defaultPhotoUrl: photoSeq[3]
    },
    {
      slideIndex: 5,
      slideNumber: '05 / 05',
      type: 'cta',
      roleTitle: 'Community Engagement',
      badge: 'Join The Conversation',
      headline: 'What Are Your Thoughts?',
      subheadline: p4.slice(0, 110) + (p4.length > 110 ? '...' : ''),
      supportingText: `Share your thoughts with our community in the comments below! 👇\n${hashtags}`,
      footerText: 'brother.com.sg • At your side',
      theme,
      defaultPhotoUrl: photoSeq[4]
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

  const isRemote = photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'));
  if (isRemote) {
    bgImg.crossOrigin = 'anonymous';
  }

  const loadImage = (src) => new Promise((resolve) => {
    bgImg.onload = () => { imgLoaded = true; resolve(); };
    bgImg.onerror = () => { imgLoaded = false; resolve(); };
    bgImg.src = src;
  });

  if (photoUrl) {
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

  // Slide Numbering (e.g. 01 / 05 in official Brother Blue)
  if (slide?.slideNumber) {
    ctx.save();
    ctx.font = 'bold 13px "Plus Jakarta Sans", monospace';
    const numWidth = ctx.measureText(slide.slideNumber).width;
    const pillW = numWidth + 24;
    const pillH = 28;
    const pillX = width - 70 - pillW;
    const pillY = isBanner ? 48 : 65;

    ctx.fillStyle = '#0f2ea2';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(slide.slideNumber, pillX + pillW / 2, pillY + 18);
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
