document.addEventListener('DOMContentLoaded', async function() {

    let salaryData;
    let roleDefinitions;

    try {
        const response = await fetch('data.json');
        const data = await response.json();
        salaryData = data.salaryData;
        roleDefinitions = data.roleDefinitions;
    } catch (error) {
        console.error('Error fetching data:', error);
        return;
    }

    const regionSelect = document.getElementById('region-select');
    const roleSelect = document.getElementById('role-select');
    const senioritySelect = document.getElementById('seniority-select');
    const detailsTitle = document.getElementById('details-title');
    const detailsText = document.getElementById('details-text');
    const accordionContainer = document.getElementById('accordion-container');

    let salaryChart;

    function formatCurrency(value, currency, symbol) {
        if (value === null) return 'N/A';
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value).replace(symbol, symbol + ' ');
    }

    function updateChart() {
        const region = regionSelect.value;
        const role = roleSelect.value;
        const seniority = senioritySelect.value;

        const data = salaryData[region][role][seniority];
        const currency = salaryData[region].currency;
        const symbol = salaryData[region].symbol;

        const privateSalary = data.private;
        const publicSalary = data.public;

        const showPublicSector = publicSalary !== null;

        salaryChart.data.labels = showPublicSector ? ['Private Sector', 'Public Sector'] : ['Private Sector'];
        salaryChart.data.datasets[0].data = showPublicSector ? [privateSalary, publicSalary] : [privateSalary];

        salaryChart.options.plugins.tooltip.callbacks.label = function(context) {
            let label = context.dataset.label || '';
            if (label) {
                label += ': ';
            }
            if (context.parsed.x !== null) {
                label += formatCurrency(context.parsed.x, currency, symbol);
            }
            return label;
        };

        salaryChart.options.scales.x.ticks.callback = function(value) {
            return formatCurrency(value, currency, symbol);
        };

        salaryChart.update();

        detailsTitle.textContent = `${seniority} ${role} in ${region}`;
        detailsText.textContent = data.text || 'No specific insight available for this selection.';
    }

    function createChart() {
        const ctx = document.getElementById('salaryChart').getContext('2d');
        salaryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Average Annual Salary',
                    data: [],
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.7)',
                        'rgba(129, 140, 248, 0.7)',
                    ],
                    borderColor: [
                        'rgba(79, 70, 229, 1)',
                        'rgba(129, 140, 248, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 4,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(229, 231, 235, 1)'
                        },
                        ticks: {
                             font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    function buildAccordion() {
        roleDefinitions.forEach((item, index) => {
            const buttonId = `accordion-button-${index}`;
            const contentId = `accordion-content-${index}`;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'bg-white border border-gray-200 rounded-lg overflow-hidden';

            itemDiv.innerHTML = `
                <h2>
                    <button type="button" id="${buttonId}" class="flex items-center justify-between w-full p-5 font-medium text-left text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-indigo-200" aria-expanded="false" aria-controls="${contentId}">
                        <span>${item.title}</span>
                        <svg class="w-3 h-3 rotate-0 shrink-0 transition-transform duration-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
                        </svg>
                    </button>
                </h2>
                <div id="${contentId}" class="hidden p-5 border-t border-gray-200">
                    <p class="text-gray-600">${item.content}</p>
                </div>
            `;

            accordionContainer.appendChild(itemDiv);

            const button = document.getElementById(buttonId);
            const content = document.getElementById(contentId);
            const icon = button.querySelector('svg');

            button.addEventListener('click', () => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                button.setAttribute('aria-expanded', !isExpanded);
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
            });
        });
    }

    regionSelect.addEventListener('change', updateChart);
    roleSelect.addEventListener('change', updateChart);
    senioritySelect.addEventListener('change', updateChart);

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    createChart();
    updateChart();
    buildAccordion();
});
