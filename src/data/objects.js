// Common printed objects with realistic PLA figures. weightG = finished part weight
// in grams, hours = typical print time on a 0.4 mm nozzle at 0.2 mm layers.
// Weights assume ~15% infill unless noted; adjust expectations for solid parts.

const O = (o) => ({ ...o });

const objects = [
  O({ id: 'benchy', name: '3DBenchy (calibration boat)', weightG: 13, hours: 1, category: 'Calibration', note: 'The standard benchmark. 13 g is typical at 0.2 mm layers and 10% infill; a solid version is about 30 g.' }),
  O({ id: 'phone-stand', name: 'phone stand', weightG: 40, hours: 3, category: 'Desk', note: 'A simple angled stand. Adding a cable slot barely changes the weight.' }),
  O({ id: 'phone-case', name: 'phone case', weightG: 20, hours: 1.2, category: 'Accessories', note: 'Flexible TPU doubles the material cost but survives drops far better than rigid plastic.' }),
  O({ id: 'vase', name: 'spiral vase', weightG: 80, hours: 4, category: 'Home', note: 'Spiral (vase) mode uses a single wall, so weight depends almost entirely on height and diameter.' }),
  O({ id: 'planter-pot', name: 'plant pot', weightG: 120, hours: 6, category: 'Garden', note: 'Use PETG or ASA outdoors — PLA sags in a hot car and degrades in sunlight.' }),
  O({ id: 'chess-set', name: 'chess set', weightG: 200, hours: 12, category: 'Games', note: 'Figures are for a full 32-piece set printed at moderate infill.' }),
  O({ id: 'headphone-stand', name: 'headphone stand', weightG: 90, hours: 4, category: 'Desk', note: 'Tall parts like this benefit from a wider base or a brim to stop tipping.' }),
  O({ id: 'cable-organizer', name: 'cable organizer clip', weightG: 15, hours: 0.7, category: 'Desk', note: 'The classic "print a bag of them" part — print 20 at once and the cost per piece collapses.' }),
  O({ id: 'raspberry-pi-case', name: 'Raspberry Pi case', weightG: 25, hours: 1.5, category: 'Tech', note: 'PETG is the usual choice so the case does not soften next to a warm board.' }),
  O({ id: 'wall-hook', name: 'wall hook', weightG: 10, hours: 0.5, category: 'Home', note: 'Print flat on its side for strength; layer lines are the weak point under load.' }),
  O({ id: 'toy-figurine', name: 'toy figurine', weightG: 30, hours: 2.5, category: 'Models', note: 'Resin printing gives far more detail for figures this size, at a higher per-gram cost.' }),
  O({ id: 'miniature', name: '28 mm tabletop miniature', weightG: 3, hours: 0.4, category: 'Models', note: 'Tiny parts are dominated by machine time, not material. Print a whole warband at once.' }),
  O({ id: 'lampshade', name: 'lampshade', weightG: 150, hours: 7, category: 'Home', note: 'Needs a heat-resistant material if it sits close to a hot bulb — ABS or ASA, not PLA.' }),
  O({ id: 'storage-box', name: 'storage box', weightG: 110, hours: 6, category: 'Storage', note: 'Thin walls and a lid. Costs scale with wall count more than with footprint.' }),
  O({ id: 'dice-tower', name: 'dice tower', weightG: 90, hours: 5, category: 'Games', note: 'Large, mostly hollow, so material cost stays modest for its size.' }),
  O({ id: 'keychain', name: 'keychain', weightG: 5, hours: 0.3, category: 'Accessories', note: 'A single keychain costs cents. They only make sense printed in batches.' }),
  O({ id: 'tablet-stand', name: 'tablet stand', weightG: 70, hours: 3, category: 'Desk', note: 'Wider and heavier than a phone stand so it does not tip under a tablet.' }),
  O({ id: 'desk-organizer', name: 'desk organizer', weightG: 130, hours: 7, category: 'Desk', note: 'One of the best value prints: it replaces a bought item and uses a lot of cheap PLA.' }),
  O({ id: 'articulated-dragon', name: 'articulated dragon', weightG: 50, hours: 3.5, category: 'Models', note: 'Print-in-place joints. Needs good tolerance calibration or the joints fuse.' }),
  O({ id: 'trex-skeleton', name: 'articulated T-Rex skeleton', weightG: 60, hours: 4, category: 'Models', note: 'Print-in-place; scale it up and the weight scales with the cube of the factor.' }),
  O({ id: 'cosplay-helmet', name: 'cosplay helmet', weightG: 300, hours: 18, category: 'Cosplay', note: 'Usually printed in pieces and glued. This is where filament cost stops being trivial.' }),
  O({ id: 'drone-frame', name: 'small drone frame', weightG: 50, hours: 3, category: 'Tech', note: 'Print in nylon or PA-CF, not PLA — crashes break brittle parts instantly.' }),
  O({ id: 'bookend', name: 'bookend', weightG: 200, hours: 9, category: 'Home', note: 'Heavy by design. Hollow with a fillable cavity if you want to save filament.' }),
  O({ id: 'birdhouse', name: 'birdhouse', weightG: 180, hours: 9, category: 'Garden', note: 'Must be PETG or ASA; PLA will not survive a summer outdoors.' }),
  O({ id: 'laptop-stand', name: 'laptop stand', weightG: 150, hours: 7, category: 'Desk', note: 'Check it does not soften under a hot laptop exhaust — PETG is the safer pick.' }),
  O({ id: 'bike-mount', name: 'bike phone mount', weightG: 35, hours: 2, category: 'Outdoors', note: 'Vibration and sun make this a PETG or ASA job, printed solid at the clamp.' }),
  O({ id: 'plant-label', name: 'plant label', weightG: 4, hours: 0.3, category: 'Garden', note: 'Print 50 at once; the per-piece cost is almost entirely machine time.' }),
  O({ id: 'coaster-set', name: 'coaster set (4)', weightG: 40, hours: 2, category: 'Home', note: 'PETG or a coated PLA handles condensation better than bare PLA.' }),
  O({ id: 'rocket-model', name: 'model rocket', weightG: 45, hours: 3, category: 'Models', note: 'Thin walls keep it light; check the centre of gravity before you fly it.' }),
  O({ id: 'napkin-holder', name: 'napkin holder', weightG: 60, hours: 3, category: 'Home', note: 'A simple, popular gift print that uses modest filament.' }),
];

const byId = Object.fromEntries(objects.map((o) => [o.id, o]));
module.exports = { objects, byId };
