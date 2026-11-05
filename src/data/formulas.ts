export interface SOMFormula {
  id: string;
  name: string;
  category: string;
  formula: string;
  variables: { symbol: string; meaning: string }[];
  importance: 'High' | 'Critical';
  spokenText: string;
  description: string;
}

export const SOM_FORMULAS: SOMFormula[] = [
  {
    id: 'hookes-law',
    name: "Hooke's Law (1D Elasticity)",
    category: 'Stress & Strain',
    formula: 'σ = E · ε',
    variables: [
      { symbol: 'σ', meaning: 'Normal stress (N/m² or Pa)' },
      { symbol: 'E', meaning: "Young's Modulus of Elasticity (N/m²)" },
      { symbol: 'ε', meaning: 'Longitudinal strain (dimensionless)' },
    ],
    importance: 'Critical',
    spokenText: "Hooke's law states that normal stress sigma equals Young's modulus E multiplied by strain epsilon.",
    description: 'Fundamental relationship valid within the proportional elastic limit of linear isotropic materials.',
  },
  {
    id: 'elastic-constants-relation',
    name: "Relation between E, G, and K",
    category: 'Elastic Constants',
    formula: 'E = (9 · K · G) / (3K + G)',
    variables: [
      { symbol: 'E', meaning: "Young's Modulus" },
      { symbol: 'K', meaning: 'Bulk Modulus' },
      { symbol: 'G', meaning: 'Modulus of Rigidity (Shear Modulus)' },
    ],
    importance: 'Critical',
    spokenText: "The relation connecting elastic constants is: Young's Modulus E equals 9 times Bulk Modulus K times Shear Modulus G, all divided by 3K plus G.",
    description: 'Connects all three primary isotropic elastic moduli by eliminating Poisson ratio.',
  },
  {
    id: 'poissons-ratio-relations',
    name: "Moduli Relations with Poisson's Ratio (ν)",
    category: 'Elastic Constants',
    formula: 'E = 2G(1 + ν) = 3K(1 - 2ν)',
    variables: [
      { symbol: 'ν', meaning: "Poisson's ratio (Lateral strain / Longitudinal strain)" },
      { symbol: 'G', meaning: 'Shear Modulus' },
      { symbol: 'K', meaning: 'Bulk Modulus' },
    ],
    importance: 'High',
    spokenText: "Young's modulus E equals 2G times quantity 1 plus Poisson's ratio nu, which also equals 3K times quantity 1 minus 2 nu.",
    description: 'Standard conversion formulas frequently asked in 1-mark competitive exams.',
  },
  {
    id: 'strain-energy-axial',
    name: 'Strain Energy under Axial Load',
    category: 'Strain Energy',
    formula: 'U = (P² · L) / (2 · A · E) = (1/2) · P · ΔL',
    variables: [
      { symbol: 'P', meaning: 'Axial tensile or compressive load (N)' },
      { symbol: 'L', meaning: 'Original length (m)' },
      { symbol: 'A', meaning: 'Cross-sectional area (m²)' },
      { symbol: 'ΔL', meaning: 'Elongation (m)' },
    ],
    importance: 'Critical',
    spokenText: "Strain energy U equals P squared times length L divided by 2 times area times Young's modulus, or half P times delta L.",
    description: 'Internal resilience work done by gradual axial loading on an elastic prismatic bar.',
  },
  {
    id: 'strain-energy-density',
    name: 'Modulus of Resilience (Energy Density)',
    category: 'Strain Energy',
    formula: 'u = σ² / (2E)',
    variables: [
      { symbol: 'u', meaning: 'Strain energy per unit volume (J/m³)' },
      { symbol: 'σ', meaning: 'Stress at elastic limit (N/m²)' },
      { symbol: 'E', meaning: "Young's Modulus" },
    ],
    importance: 'Critical',
    spokenText: "Strain energy stored per unit volume equals stress sigma squared divided by 2 times Young's modulus E.",
    description: 'Measure of material capacity to absorb energy elastically without permanent deformation.',
  },
  {
    id: 'pure-torsion-equation',
    name: 'Torsion Equation for Circular Shafts',
    category: 'Torsion & Shafts',
    formula: 'T / J = τ / r = (G · θ) / L',
    variables: [
      { symbol: 'T', meaning: 'Applied twisting torque (N·m)' },
      { symbol: 'J', meaning: 'Polar moment of inertia (m⁴)' },
      { symbol: 'τ', meaning: 'Shear stress at radius r (N/m²)' },
      { symbol: 'G', meaning: 'Modulus of rigidity (N/m²)' },
      { symbol: 'θ', meaning: 'Angle of twist (radians)' },
      { symbol: 'L', meaning: 'Length of shaft (m)' },
    ],
    importance: 'Critical',
    spokenText: "Torsion equation states: Torque T over polar moment of inertia J equals shear stress tau over radius r, equals G times twist angle theta over shaft length L.",
    description: 'Governing relation for circular and hollow shafts under pure torsion.',
  },
  {
    id: 'polar-modulus-solid',
    name: 'Polar Section Modulus (Solid Shaft)',
    category: 'Torsion & Shafts',
    formula: 'Z_p = (π · d³) / 16',
    variables: [
      { symbol: 'd', meaning: 'Shaft diameter (m)' },
      { symbol: 'Z_p', meaning: 'Polar modulus (m³)' },
    ],
    importance: 'Critical',
    spokenText: "Polar section modulus for a solid circular shaft is pi times d cube divided by 16.",
    description: 'Maximum torsional shear stress is τ_max = T / Z_p.',
  },
  {
    id: 'polar-modulus-hollow',
    name: 'Polar Section Modulus (Hollow Shaft)',
    category: 'Torsion & Shafts',
    formula: 'Z_p = (π / 16) · [(D⁴ - d⁴) / D]',
    variables: [
      { symbol: 'D', meaning: 'Outer diameter (m)' },
      { symbol: 'd', meaning: 'Inner diameter (m)' },
    ],
    importance: 'High',
    spokenText: "For a hollow circular shaft, polar section modulus equals pi divided by 16 times outer diameter D to the fourth minus inner diameter d to the fourth, divided by outer diameter D.",
    description: 'Enables high torque transmission with significantly reduced shaft weight.',
  },
  {
    id: 'shaft-power-transmission',
    name: 'Power Transmitted by Rotating Shaft',
    category: 'Torsion & Shafts',
    formula: 'P = (2 · π · N · T) / 60',
    variables: [
      { symbol: 'P', meaning: 'Power in Watts (W)' },
      { symbol: 'N', meaning: 'Rotational speed (RPM)' },
      { symbol: 'T', meaning: 'Transmitted torque (N·m)' },
    ],
    importance: 'High',
    spokenText: "Power transmitted by a shaft equals 2 pi N T divided by 60 Watts.",
    description: 'Relates torque output to angular rotational speed in mechanical transmissions.',
  },
  {
    id: 'helical-spring-deflection',
    name: 'Axial Deflection of Helical Spring',
    category: 'Springs & Thin Cylinders',
    formula: 'δ = (8 · W · D³ · n) / (G · d⁴)',
    variables: [
      { symbol: 'W', meaning: 'Axial load (N)' },
      { symbol: 'D', meaning: 'Mean coil diameter (m)' },
      { symbol: 'n', meaning: 'Number of active coils' },
      { symbol: 'd', meaning: 'Wire diameter (m)' },
      { symbol: 'G', meaning: 'Modulus of rigidity' },
    ],
    importance: 'Critical',
    spokenText: "Deflection delta of a closed coiled helical spring equals 8 times axial load W times mean diameter D cubed times number of coils n, divided by shear modulus G times wire diameter d to the fourth power.",
    description: 'Governs spring flexibility and deflection under pure axial pulling or compression.',
  },
  {
    id: 'helical-spring-stiffness',
    name: 'Stiffness of Closely Coiled Spring',
    category: 'Springs & Thin Cylinders',
    formula: 'k = W / δ = (G · d⁴) / (8 · D³ · n)',
    variables: [
      { symbol: 'k', meaning: 'Spring stiffness / constant (N/m)' },
      { symbol: 'n', meaning: 'Number of active turns' },
    ],
    importance: 'Critical',
    spokenText: "Spring stiffness k equals G times d to the fourth power divided by 8 times mean diameter D cubed times number of coils n. Stiffness is inversely proportional to number of coils.",
    description: 'Shows that cutting a spring in half doubles its stiffness.',
  },
  {
    id: 'hoop-stress-cylinder',
    name: 'Circumferential / Hoop Stress (Thin Cylinder)',
    category: 'Springs & Thin Cylinders',
    formula: 'σ_h = (p · d) / (2 · t)',
    variables: [
      { symbol: 'p', meaning: 'Internal fluid pressure (N/m²)' },
      { symbol: 'd', meaning: 'Internal cylinder diameter (m)' },
      { symbol: 't', meaning: 'Wall thickness (m)' },
    ],
    importance: 'Critical',
    spokenText: "Hoop stress sigma h in a thin cylinder equals internal pressure p times diameter d divided by 2 times thickness t.",
    description: 'Primary failure stress that causes longitudinal bursting along the length of boilers and pipes.',
  },
  {
    id: 'longitudinal-stress-cylinder',
    name: 'Longitudinal Stress (Thin Cylinder)',
    category: 'Springs & Thin Cylinders',
    formula: 'σ_l = (p · d) / (4 · t) = (1/2) · σ_h',
    variables: [
      { symbol: 'σ_l', meaning: 'Axial longitudinal tensile stress (N/m²)' },
      { symbol: 'σ_h', meaning: 'Hoop stress' },
    ],
    importance: 'Critical',
    spokenText: "Longitudinal stress in a thin cylinder equals p times d divided by 4t, which is exactly half of the hoop stress.",
    description: 'Resists circumferential joints pulling apart.',
  },
];
