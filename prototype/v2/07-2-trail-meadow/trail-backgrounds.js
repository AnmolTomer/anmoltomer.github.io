const SVG_NS = 'http://www.w3.org/2000/svg';

export const TRAIL_BACKGROUNDS = Object.freeze([
  { id: 'survey-contours', name: 'Survey contours' },
  { id: 'ridge-folds', name: 'Ridge folds' },
  { id: 'watershed-chart', name: 'Watershed chart' },
  { id: 'field-paper', name: 'Field paper' },
]);

function contourIsland(x, y, rotation, scales) {
  const contour = 'M-180-30C-176-150-52-226 62-176S245-62 201 62 78 233-58 182-200 85-180-30Z';
  return `<g transform="translate(${x} ${y}) rotate(${rotation})">${scales.map(function (scale, index) {
    return `<path class="${index % 3 === 0 ? 'tb-index-contour' : ''}" d="${contour}" transform="scale(${scale})"/>`;
  }).join('')}</g>`;
}

function surveyContours() {
  return `<g class="tb-contours">
    ${contourIsland(95, 420, -24, [.35, .57, .8, 1.04, 1.29, 1.55, 1.82, 2.1])}
    ${contourIsland(1400, 1210, 32, [.42, .68, .95, 1.22, 1.5, 1.79, 2.1, 2.42])}
    ${contourIsland(1300, 145, -42, [.38, .64, .92, 1.23])}
  </g><g class="tb-survey-ticks"><path d="M67 816h24m-12-12v24M1350 676h24m-12-12v24M180 1370h24m-12-12v24"/></g>`;
}

function ridgeFolds() {
  return `<g class="tb-ridge-surfaces">
    <path class="tb-ridge-far" d="M0 160C170 70 260 260 460 170S790 90 960 190 1260 240 1440 110V550C1220 650 1130 540 950 630S620 690 440 610 150 680 0 580Z"/>
    <path class="tb-ridge-middle" d="M0 580C150 680 260 530 440 610S780 720 950 630 1220 650 1440 550V1110C1260 1000 1160 1190 970 1090S650 1020 460 1130 170 1080 0 1180Z"/>
    <path class="tb-ridge-near" d="M0 1180C170 1080 280 1240 460 1130S780 990 970 1090 1260 1000 1440 1110V1600H0Z"/>
  </g><g class="tb-ridge-lines">
    <path d="M0 160C170 70 260 260 460 170S790 90 960 190 1260 240 1440 110"/>
    <path d="M0 580C150 680 260 530 440 610S780 720 950 630 1220 650 1440 550"/>
    <path d="M0 1180C170 1080 280 1240 460 1130S780 990 970 1090 1260 1000 1440 1110"/>
  </g>`;
}

function watershedChart() {
  return `<g class="tb-watershed-land"><path d="M-90 120C165 245 300 400 207 632S80 969 215 1120 280 1450 140 1670"/><path d="M1500 100C1230 335 1140 400 1220 658S1405 1020 1260 1240 1160 1510 1330 1690"/></g>
  <g class="tb-water-bank"><path d="M-20 140C140 230 234 382 149 584S53 943 174 1100 221 1430 87 1620"/><path d="M1480 150C1310 350 1195 431 1276 668S1438 1012 1307 1247 1230 1500 1390 1650"/></g>
  <g class="tb-water-stream"><path d="M-20 140C140 230 234 382 149 584S53 943 174 1100 221 1430 87 1620"/><path d="M1480 150C1310 350 1195 431 1276 668S1438 1012 1307 1247 1230 1500 1390 1650"/></g>
  <g class="tb-water-tributary"><path d="M0 447C51 465 114 442 183 450M0 846C54 807 86 780 93 738M0 1300C79 1260 127 1270 210 1303M1440 545C1370 550 1310 572 1252 579M1440 995C1390 980 1365 950 1357 906M1440 1425C1367 1400 1324 1414 1285 1410"/></g>
  <g class="tb-water-relief"><path d="M-80 325C140 380 322 480 224 719M-75 1000C47 1080 370 1140 291 1420M1530 260C1310 420 1060 550 1172 806M1510 1070C1350 1140 1110 1380 1235 1590"/></g>`;
}

function fieldPaper() {
  return `<g class="tb-paper-folds"><path d="M308 0V1600M1132 0V1600"/></g>
  <g class="tb-paper-registration"><path d="M56 140h30m-15-15v30M1354 140h30m-15-15v30M56 1450h30m-15-15v30M1354 1450h30m-15-15v30"/></g>`;
}

const BACKGROUND_DRAWINGS = {
  'survey-contours': surveyContours,
  'ridge-folds': ridgeFolds,
  'watershed-chart': watershedChart,
  'field-paper': fieldPaper,
};

/** Add an explicit candidate; absent or unknown variants retain the incumbent. */
export function mountTrailBackground(section, { variant } = {}) {
  if (!section) return null;
  section.querySelector(':scope > .trail-bg')?.remove();
  delete section.dataset.trailBg;
  if (!Object.hasOwn(BACKGROUND_DRAWINGS, variant)) return null;

  const background = document.createElement('div');
  background.className = 'trail-bg';
  background.setAttribute('aria-hidden', 'true');

  const drawing = document.createElementNS(SVG_NS, 'svg');
  drawing.setAttribute('viewBox', '0 0 1440 1600');
  drawing.setAttribute('preserveAspectRatio', 'none');
  drawing.setAttribute('focusable', 'false');
  drawing.innerHTML = BACKGROUND_DRAWINGS[variant]();
  background.append(drawing);
  section.dataset.trailBg = variant;
  section.prepend(background);
  return background;
}
