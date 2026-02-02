import { StatsCard } from './StatsCard.js';

export function StatsGrid(stats) {
    const grid = document.createElement('div');
    grid.classList.add('stats-grid');

    stats.forEach(stat => {
        grid.appendChild(StatsCard(stat.label, stat.value, stat.iconColor, stat.iconSvg, stat.footer));
    });

    return grid;
}
