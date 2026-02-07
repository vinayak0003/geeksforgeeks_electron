
// using native fetch

async function testApi() {
    try {
        const response = await fetch('http://localhost:3000/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "What is the weather like today?",
                context: { monthlyIncome: 1000, monthlyExpenses: 500, dna: {}, currentInvestments: 0 },
                mode: 'chat'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testApi();
