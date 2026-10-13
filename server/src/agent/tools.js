import { db, auditProduct } from '../db.js';
import { WooCommerceService } from '../services/woocommerceService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tool 1: inspect_catalogue
 * Inspects real product records and identifies catalogue-quality issues.
 */
export async function inspect_catalogue(args = {}) {
  const { filter = 'all' } = args;
  const products = db.getProducts();

  const audited = products.map(p => {
    const audit = auditProduct(p);
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      status: p.status,
      qualityScore: audit.score,
      issues: audit.issues
    };
  });

  const total = audited.length;
  const needsAttention = audited.filter(p => p.issues.length > 0 || p.qualityScore < 80);
  const published = audited.filter(p => p.status === 'publish');
  const drafts = audited.filter(p => p.status === 'draft');
  const avgScore = total > 0 ? Math.round(audited.reduce((acc, p) => acc + p.qualityScore, 0) / total) : 0;

  let filtered = audited;
  if (filter === 'needs_attention') {
    filtered = needsAttention;
  } else if (filter === 'missing_description') {
    filtered = audited.filter(p => p.issues.some(i => i.code === 'MISSING_DESCRIPTION' || i.code === 'SHORT_DESCRIPTION'));
  } else if (filter === 'missing_category') {
    filtered = audited.filter(p => p.issues.some(i => i.code === 'MISSING_CATEGORY'));
  } else if (filter === 'invalid_price') {
    filtered = audited.filter(p => p.issues.some(i => i.code === 'INVALID_PRICE'));
  }

  return {
    summary: {
      totalProducts: total,
      publishedProducts: published.length,
      draftProducts: drafts.length,
      productsRequiringAttention: needsAttention.length,
      averageQualityScore: avgScore,
      catalogueHealth: avgScore >= 80 ? 'Good' : avgScore >= 60 ? 'Fair' : 'Needs Optimization'
    },
    flaggedProductsCount: filtered.length,
    flaggedProducts: filtered.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category || 'MISSING',
      price: p.price,
      qualityScore: `${p.qualityScore}%`,
      issues: p.issues.map(i => `[${i.severity.toUpperCase()}] ${i.label}`)
    })),
    recommendation: needsAttention.length > 0
      ? `Found ${needsAttention.length} products with quality deficiencies. Recommend running suggest_product_fixes to generate optimized descriptions, categories, and attributes.`
      : 'All products currently meet catalogue quality benchmarks.'
  };
}

/**
 * Realistic AI Content Generator for Products (Deterministic or LLM-assisted)
 */
function generateFixesForProduct(product) {
  const fixes = {};
  const reasoning = [];

  // Description fix
  if (!product.description || product.description.trim().length < 50) {
    if (product.name.toLowerCase().includes('earbuds') || product.name.toLowerCase().includes('audio')) {
      fixes.description = `Experience studio-grade acoustics with the ${product.name}. Featuring active hybrid noise cancellation (up to -35dB), custom 10mm titanium drivers for deep bass, and dual beamforming microphones with AI wind reduction for crystal-clear calls. Includes IPX5 sweat resistance and up to 32 hours total playback with USB-C wireless charging case.`;
      reasoning.push('Generated comprehensive audio e-commerce description with technical specifications, driver details, and battery life.');
    } else if (product.name.toLowerCase().includes('charger') || product.name.toLowerCase().includes('gan')) {
      fixes.description = `Engineered with next-generation Gallium Nitride (GaN III) semiconductors, the ${product.name} delivers ultra-efficient, high-speed power delivery in a compact pocket footprint. Dual-port architecture supports simultaneous laptop and smartphone charging with intelligent temperature monitoring and universal voltage compatibility (100-240V).`;
      reasoning.push('Generated GaN charging product description emphasizing portability, safety protocols, and dual-port fast charging.');
    } else if (product.name.toLowerCase().includes('keyboard')) {
      fixes.description = `Built for discerning typists and gamers alike, the ${product.name} features an aerospace-grade aluminum top plate, hot-swappable PCB, and sound-dampening silicone gaskets. Enjoy per-key RGB backlighting with dynamic software customization, seamless Bluetooth 5.1/2.4GHz wireless connectivity, and pre-lubed mechanical switches.`;
      reasoning.push('Generated mechanical keyboard description highlighting gasket design, hot-swap PCB, and acoustics.');
    } else if (product.name.toLowerCase().includes('table') || product.name.toLowerCase().includes('furniture')) {
      fixes.description = `Meticulously crafted from FSC-certified solid white oak, the ${product.name} embodies timeless Scandinavian simplicity and craftsmanship. Finished with a durable organic matte lacquer resistant to daily spills and UV fading. Clean chamfered edge profiles and reinforced mortise-and-tenon joinery ensure generational durability.`;
      reasoning.push('Generated Scandinavian furniture description highlighting sustainably sourced wood, craftsmanship, and finish.');
    } else {
      fixes.description = `The ${product.name} is engineered to deliver exceptional performance and reliability. Crafted from premium materials to exacting standards, it offers superior functionality, modern aesthetics, and intuitive usability suited for everyday lifestyle and professional demands.`;
      reasoning.push('Generated tailored e-commerce product description.');
    }
  }

  // Category fix
  if (!product.category || product.category.trim().length === 0 || product.category.toLowerCase() === 'uncategorized') {
    if (product.name.toLowerCase().includes('earbud') || product.name.toLowerCase().includes('sound') || product.name.toLowerCase().includes('audio')) {
      fixes.category = 'Audio & Electronics';
      reasoning.push('Classified into "Audio & Electronics" based on acoustic product naming.');
    } else if (product.name.toLowerCase().includes('bottle') || product.name.toLowerCase().includes('cup') || product.name.toLowerCase().includes('hydro')) {
      fixes.category = 'Sports & Outdoor Hydration';
      reasoning.push('Classified into "Sports & Outdoor Hydration" based on drinkware profile.');
    } else if (product.name.toLowerCase().includes('chair') || product.name.toLowerCase().includes('table') || product.name.toLowerCase().includes('desk')) {
      fixes.category = 'Office & Home Furniture';
      reasoning.push('Classified into "Office & Home Furniture".');
    } else {
      fixes.category = 'General Merchandise';
      reasoning.push('Assigned appropriate commercial category.');
    }
  }

  // Attributes fix
  if (!product.attributes || product.attributes.length === 0) {
    const nameLower = product.name.toLowerCase();
    if (nameLower.includes('earbud') || nameLower.includes('audio') || nameLower.includes('headphone')) {
      fixes.attributes = [
        { name: 'Noise Cancellation', options: ['Hybrid Active Noise Cancelling (ANC)'] },
        { name: 'Battery Life', options: ['8h Playback + 24h Case (32h Total)'] },
        { name: 'Water Resistance', options: ['IPX5 Splashproof'] }
      ];
      reasoning.push('Structured standard technical specifications (ANC, Battery Life, IPX rating).');
    } else if (nameLower.includes('bottle') || nameLower.includes('cup') || nameLower.includes('flask')) {
      fixes.attributes = [
        { name: 'Capacity', options: ['1000ml / 32oz'] },
        { name: 'Thermal Retention', options: ['24h Cold / 12h Hot'] },
        { name: 'Material', options: ['18/8 Pro-Grade Stainless Steel, BPA-Free'] }
      ];
      reasoning.push('Added bottle specifications (Capacity, Thermal Retention, Material).');
    } else if (nameLower.includes('camera') || nameLower.includes('cam') || nameLower.includes('solar')) {
      fixes.attributes = [
        { name: 'Resolution', options: ['4K Ultra-HD (3840x2160)'] },
        { name: 'Power Source', options: ['Solar Panel + Rechargeable Battery'] },
        { name: 'Connectivity', options: ['Dual-Band Wi-Fi 2.4/5GHz'] }
      ];
      reasoning.push('Structured camera specifications (4K Resolution, Solar Power, Wi-Fi Connectivity).');
    } else if (nameLower.includes('keyboard') || nameLower.includes('mouse') || nameLower.includes('peripheral')) {
      fixes.attributes = [
        { name: 'Connectivity', options: ['Tri-Mode: 2.4GHz / Bluetooth 5.1 / Type-C'] },
        { name: 'Battery Life', options: ['Up to 200 Hours (RGB Off)'] },
        { name: 'Compatibility', options: ['Windows, macOS, Linux, iOS, Android'] }
      ];
      reasoning.push('Added peripheral hardware specifications.');
    } else if (nameLower.includes('shoe') || nameLower.includes('apparel') || nameLower.includes('wear')) {
      fixes.attributes = [
        { name: 'Material', options: ['Breathable Supercritical Foam & Ripstop Mesh'] },
        { name: 'Fit', options: ['True to Size (Standard Width)'] },
        { name: 'Origin', options: ['Ethically Manufactured'] }
      ];
      reasoning.push('Added apparel specifications.');
    } else {
      fixes.attributes = [
        { name: 'Build Quality', options: ['Premium High-Durability Materials'] },
        { name: 'Warranty', options: ['1-Year Comprehensive Manufacturer Warranty'] },
        { name: 'Standards', options: ['CE, FCC, RoHS Certified'] }
      ];
      reasoning.push('Structured standard e-commerce specifications and warranty attributes.');
    }
  }

  // Invalid price fix suggestion
  if (product.price === undefined || product.price === null || Number(product.price) <= 0) {
    const nameLower = product.name.toLowerCase();
    let suggestedPrice = 49.99;
    if (nameLower.includes('keyboard')) suggestedPrice = 129.99;
    else if (nameLower.includes('camera')) suggestedPrice = 89.99;
    else if (nameLower.includes('chair')) suggestedPrice = 249.99;
    else if (nameLower.includes('earbud')) suggestedPrice = 79.99;

    fixes.price = suggestedPrice;
    fixes.regularPrice = Math.round((suggestedPrice * 1.2) * 100) / 100;
    reasoning.push(`Identified zero/invalid price. Suggested standard retail price of $${suggestedPrice} based on category benchmarks.`);
  }

  return { fixes, reasoning: reasoning.join(' ') };
}

/**
 * Tool 2: suggest_product_fixes
 * Generates proposed fixes for products and stages them for human approval.
 */
export async function suggest_product_fixes(args = {}) {
  const { productIds = [] } = args;
  const allProducts = db.getProducts();

  let targetProducts = [];
  if (Array.isArray(productIds) && productIds.length > 0) {
    targetProducts = allProducts.filter(p => productIds.includes(p.id));
  } else {
    // Target all products with issues
    targetProducts = allProducts.filter(p => {
      const audit = auditProduct(p);
      return audit.issues.length > 0 || audit.score < 80;
    });
  }

  if (targetProducts.length === 0) {
    return {
      message: 'No eligible products found needing fixes.',
      proposalsCount: 0,
      proposals: []
    };
  }

  const generatedProposals = [];

  for (const product of targetProducts) {
    const { fixes, reasoning } = generateFixesForProduct(product);

    if (Object.keys(fixes).length > 0) {
      // Calculate projected score if fixes are applied
      const projectedProduct = { ...product, ...fixes };
      const currentAudit = auditProduct(product);
      const projectedAudit = auditProduct(projectedProduct);

      const proposal = {
        id: `prop_${uuidv4().slice(0, 8)}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentScore: currentAudit.score,
        projectedScore: projectedAudit.score,
        changes: fixes,
        reasoning,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      generatedProposals.push(proposal);
    }
  }

  // Save generated proposals to database staging queue
  db.saveProposals(generatedProposals);

  db.addLog(
    'AI_PROPOSALS_GENERATED',
    `Product Catalogue AI Agent staged ${generatedProposals.length} improvement proposals awaiting human approval.`,
    'info',
    { proposalCount: generatedProposals.length }
  );

  return {
    message: `Generated ${generatedProposals.length} proposed catalogue enhancements. Staged in pending approval queue for human verification.`,
    proposalsCount: generatedProposals.length,
    proposals: generatedProposals.map(p => ({
      id: p.id,
      productId: p.productId,
      productName: p.productName,
      sku: p.sku,
      currentScore: `${p.currentScore}%`,
      projectedScore: `${p.projectedScore}%`,
      changesSummary: Object.keys(p.changes).join(', '),
      reasoning: p.reasoning,
      requiresApproval: true
    }))
  };
}

/**
 * Tool 3: apply_product_fixes
 * Applies user-approved fixes to the database.
 */
export async function apply_product_fixes(args = {}) {
  const { proposalIds = [] } = args;
  const existingProposals = db.getProposals();

  const toApply = existingProposals.filter(p =>
    (proposalIds.includes(p.id) || proposalIds.includes(p.productId)) && p.status === 'pending'
  );

  if (toApply.length === 0) {
    return {
      success: false,
      appliedCount: 0,
      message: 'No matching pending proposals found to apply. Ensure proposals exist and have not already been processed.'
    };
  }

  const results = [];
  for (const prop of toApply) {
    try {
      const res = db.approveProposal(prop.id);
      results.push({
        proposalId: prop.id,
        productId: res.product.id,
        productName: res.product.name,
        newScore: `${res.product.qualityScore}%`,
        status: 'applied'
      });
    } catch (err) {
      results.push({
        proposalId: prop.id,
        error: err.message,
        status: 'failed'
      });
    }
  }

  return {
    success: true,
    appliedCount: results.filter(r => r.status === 'applied').length,
    appliedProposals: results,
    message: `Successfully applied ${results.filter(r => r.status === 'applied').length} verified product enhancements to the catalogue database.`
  };
}

/**
 * Tool 4: sync_product
 * Synchronizes a product to WooCommerce (real or demo mode).
 */
export async function sync_product(args = {}) {
  const { productId } = args;
  if (!productId) {
    throw new Error('sync_product requires a valid productId argument.');
  }

  try {
    const result = await WooCommerceService.syncProduct(productId);
    return {
      success: true,
      productId,
      productName: result.product.name,
      sku: result.product.sku,
      wooId: result.wooId,
      isDemo: result.isDemo,
      message: result.message
    };
  } catch (err) {
    return {
      success: false,
      productId,
      error: err.message,
      message: `Failed to synchronize product: ${err.message}`
    };
  }
}

// Tool definitions for Function Calling
export const TOOL_DEFINITIONS = [
  {
    name: 'inspect_catalogue',
    description: 'Inspects product records in the catalogue, runs quality audit, and identifies catalogue data-quality problems (missing descriptions, blank categories, invalid prices, missing attributes).',
    parameters: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          enum: ['all', 'needs_attention', 'missing_description', 'missing_category', 'invalid_price'],
          description: 'Filter catalogue inspection to specific issue types.'
        }
      }
    }
  },
  {
    name: 'suggest_product_fixes',
    description: 'Generates targeted AI content fixes (professional e-commerce description, accurate category, technical attributes) for flagged products and stages them for human approval. Never modifies database without approval.',
    parameters: {
      type: 'object',
      properties: {
        productIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional list of specific product IDs to generate fixes for. If empty, targets all products requiring attention.'
        }
      }
    }
  },
  {
    name: 'apply_product_fixes',
    description: 'Applies only human-approved product enhancements to the database. Validates changes, updates product quality scores, and records an audit log.',
    parameters: {
      type: 'object',
      properties: {
        proposalIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of proposal IDs to approve and apply to the catalogue.'
        }
      },
      required: ['proposalIds']
    }
  },
  {
    name: 'sync_product',
    description: 'Synchronizes a product with WooCommerce if credentials are configured, or safely simulates in DEMO MODE with WooCommerce REST API v3 schema validation.',
    parameters: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The ID of the product to synchronize with WooCommerce.'
        }
      },
      required: ['productId']
    }
  }
];

export async function executeToolCall(toolName, args) {
  switch (toolName) {
    case 'inspect_catalogue':
      return await inspect_catalogue(args);
    case 'suggest_product_fixes':
      return await suggest_product_fixes(args);
    case 'apply_product_fixes':
      return await apply_product_fixes(args);
    case 'sync_product':
      return await sync_product(args);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
