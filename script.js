document.addEventListener('DOMContentLoaded', () => {
    const lanes = document.querySelectorAll('.lane-marker');
    const mainCar = document.getElementById('main-car');
    const frontCar = document.getElementById('car-D');
    const distanceSelect = document.getElementById('follow-distance');
    const tjaStatusDisplay = document.getElementById('tja-status');
    const speedDisplay = document.getElementById('speed-value');

    let speed = 0;
    let offset = 0;
    let followDistance = 'medium'; // default
    let running = false;
    let animationId;

    let tjas = false;
    let cruise = false;
    let lane = false;

    // Speed units to km conversion factor
    const speedtoKmh = 15; 

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
        updateDashboard();
        if (tjas){updateFollowDistance();}
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

    // Function to update the front car's position based on follow distance
    function updateFollowDistance() {
        if (tjas){     
            let pos;

            let posPercent;
            const frontCarRect = frontCar.getBoundingClientRect();
            const roadRect = document.getElementById('road').getBoundingClientRect();
            let carWidth = 180;
            let frontCarLeft = frontCarRect.left - roadRect.left;

            switch (followDistance) {
                case 'short':
                    pos = frontCarLeft - (carWidth * 1.5);  // small gap
                    break;
                case 'medium':
                    pos = frontCarLeft - (carWidth * 2); // medium gap
                    break;
                case 'long':
                    pos = frontCarLeft - (carWidth * 2.5); // large gap
                    break;
            }
            
            posPercent = (pos / roadRect.width) * 100;

            mainCar.style.left = `${posPercent}%`;
        }
    }

    // Update when dropdown changes
    distanceSelect.addEventListener('change', (e) => {
        followDistance = e.target.value;
        updateFollowDistance();
    });
    

    function updateSpeed() {
        speed = 0;
        if (tjas) speed += 4;
        if (cruise) speed += 2;
        if (!tjas && !cruise) speed = 1; // default slow speed
        updateSpeedometer();
    }

    function animate() {
        if (!running) return;

        offset += speed;
        lanes.forEach(lane => {
            lane.style.backgroundPositionX = `-${offset}px`;
        });

        animationId = requestAnimationFrame(animate);
    }

    // Function to update the dashboard display
    function updateDashboard() {
        if (tjas) {
            tjaStatusDisplay.textContent = 'TJA Enabled, Driver not in Control';
            tjaStatusDisplay.classList.add('enabled');
            tjaStatusDisplay.classList.remove('disabled');
        } else {
            tjaStatusDisplay.textContent = 'TJA Disabled, Driver in Control';
            tjaStatusDisplay.classList.add('disabled');
            tjaStatusDisplay.classList.remove('enabled');
        }
    }

    // Function to update speedometer 
    function updateSpeedometer(){
        const kmh = Math.round(speed * speedtoKmh);
        speedDisplay.textContent = kmh;
    }
    updateFollowDistance();
    updateSpeed();
    updateDashboard();
    updateSpeedometer();
});
