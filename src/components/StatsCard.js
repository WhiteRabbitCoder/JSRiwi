export function StatsCard(label, value, iconColor, iconSvg, footer) {
    const card = document.createElement('div');
    card.classList.add('stat-card');

    card.innerHTML = `
        <div class="stat-header">
            <span class="stat-label">${label}</span>
            <div class="stat-icon ${iconColor}">
                ${iconSvg}
            </div>
        </div>
        <div class="stat-value">${value}</div>
        ${footer ? `<div class="stat-footer ${footer.type}">${footer.content}</div>` : ''}
    `;

    return card;
}
