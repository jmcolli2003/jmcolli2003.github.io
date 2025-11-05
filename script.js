document.addEventListener('DOMContentLoaded', () => {
    const car = document.getElementById('car');

    let speed = 0;
    let position = 0;
    let animationId;
    let running = false;

    let tjas = false;
    let cruise = false;
    let lane = false;

    // Buttons
    document.getElementById('start').onclick = () => {
        if (!running) {
            running = true;
            animate();
        }
    };

    document.getElementById('stop').onclick = () => {
        running = false;
        cancelAnimationFrame(animationId);
    };

    document.getElementById('toggle-tjas').onclick = () => {
        tjas = !tjas;
        updateSpeed();
    };

    document.getElementById('toggle-cruise').onclick = () => {
        cruise = !cruise;
        updateSpeed();
    };

    function updateSpeed() {
        speed = 0;
        if (tjas) speed += 2;
        if (cruise) speed += 1.5;
        if (!tjas && !cruise) speed = 1; // default speed
    }

    function animate() {
        if (!running) return;

        position += speed;
        if (position > 800) position = -50; // loop to left
        car.style.left = position + "px";

        animationId = requestAnimationFrame(animate);
    }

    // Set default speed
    updateSpeed();
});
