document.addEventListener('DOMContentLoaded', () => {
    const lanes = document.querySelectorAll('.lane-marker');
    const car = document.getElementById('car');

    let speed = 0;
    let offset = 0;
    let running = false;
    let animationId;

    let tjas = false;
    let cruise = false;
    let lane = false;

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
        document.getElementById('toggle-tjas').classList.toggle('toggle-active', tjas);
    };

    document.getElementById('toggle-cruise').onclick = () => {
        cruise = !cruise;
        updateSpeed();
        document.getElementById('toggle-cruise').classList.toggle('toggle-active', cruise);
    };

    document.getElementById('toggle-lane').onclick = () => {
        lane = !lane;
        document.getElementById('toggle-lane').classList.toggle('toggle-active', lane);
    };

    function updateSpeed() {
        speed = 0;
        if (tjas) speed += 4;
        if (cruise) speed += 2;
        if (!tjas && !cruise) speed = 1; // default slow speed
    }

    function animate() {
        if (!running) return;

        offset += speed;
        lanes.forEach(lane => {
            lane.style.backgroundPositionX = `-${offset}px`;
        });

        animationId = requestAnimationFrame(animate);
    }

    updateSpeed();
});
