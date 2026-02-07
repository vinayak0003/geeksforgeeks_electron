// Test script to verify blueprint PDF generation
const testContext = {
    monthlyIncome: 100000,
    monthlyExpenses: 60000,
    currentInvestments: 500000,
    healthCover: 300000,
    termCover: 5000000,
    dna: {
        shopping: 5000,
        party: 3000,
        habits: 2000,
        food: 8000,
        travel: 5000,
        rent: 25000,
        subscriptions: 2000,
        trips: 5000,
        commute: 3000,
        sips: 0,
        investments: 0
    },
    simulationResults: {
        riskScore: 65,
        data: []
    }
};

async function testBlueprint() {
    try {
        console.log('Testing blueprint API with context:', testContext);

        const response = await fetch('http://localhost:3000/api/blueprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: testContext })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const blob = await response.blob();
            console.log('PDF blob size:', blob.size, 'bytes');
            console.log('PDF blob type:', blob.type);

            // Save to file
            const fs = require('fs');
            const buffer = Buffer.from(await blob.arrayBuffer());
            fs.writeFileSync('test-blueprint.pdf', buffer);
            console.log('✓ PDF saved as test-blueprint.pdf');
        } else {
            const error = await response.text();
            console.error('Error response:', error);
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testBlueprint();
