async function test() {
    try {
        const res = await fetch('http://localhost:8080/api/hotels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ten: "Test Hotel",
                diaChi: "Test Addr",
                soSao: 5,
                viTriId: 1,
                managerEmail: "admin@hotel.com",
                managerPassword: "Password@123",
                managerName: "Admin Test"
            })
        });
        const status = res.status;
        const text = await res.text();
        console.log(`STATUS: ${status}`);
        console.log(`BODY: ${text}`);
    } catch(e) {
        console.error(e);
    }
}
test();
