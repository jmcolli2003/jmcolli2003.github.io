document.addEventListener('DOMContentLoaded', () => {
    const lanes = document.querySelectorAll('.lane-marker');
    const mainCar = document.getElementById('main-car');
    const frontCar = document.getElementById('car-D');
    const distanceSelect = document.getElementById('follow-distance');
    const tjaStatusDisplay = document.getElementById('tja-status');
    const speedDisplay = document.getElementById('speed-value');
    const followDistanceControls = document.getElementById("follow-distance-control");
    const gasPedal = document.getElementById('gas-pedal');
    const gasPedalStatus = document.getElementById('gas-pedal-status');

    let speed = 0;
    let offset = 0;
    let followDistance = 'medium'; // default
    let running = false;
    let animationId;

    let tjas = false;
    let cruise = false;
    let lane = false;

    let gasPedalPressed = false;
    let baseSpeed = 0; // base speed from systems
    let acceleration = 0; // additional speed from gas pedal

    // Speed units to km conversion factor
    const speedtoKmh = 15; 

    document.getElementById('start').onclick = () => {
        if (!running) {
            running = true;
            updateFollowDistance();
            updateSpeed();
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
        if (tjas && running){ updateFollowDistance(); }

        if(tjas) { 
            followDistanceControls.style.display = "block"; 
            updateFollowDistance();
        }
        else { followDistanceControls.style.display = "none"; }

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
        if (tjas && running){     
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
        if(running)
        {
        if (tjas) speed += 4;
        if (cruise) speed += 2;
        if (!tjas && !cruise) speed = 1; // default slow speed
        }
        updateSpeedometer();
    }

    function animate() {
        if (!running) return;

        // Handle gas pedal acceleration
        if (gasPedalPressed && !tjas) {
            acceleration = Math.min(acceleration + 0.02, 5); // Max boost of 5 units
            const mainCarRect = mainCar.getBoundingClientRect();
            const roadRect = document.getElementById('road').getBoundingClientRect();
            let currentLeft = mainCarRect.left - roadRect.left;
            let newLeft = currentLeft + (acceleration * .6); // Move right based on boost
            let newLeftPercent = (newLeft / roadRect.width) * 100;
            
            // Keep car within bounds
            if (newLeftPercent < 70) {
                mainCar.style.left = `${newLeftPercent}%`;
            }
        } else {
            acceleration = Math.max(acceleration - 0.01, 1); // Gradually decrease
        }

        speed = baseSpeed + acceleration;
        updateSpeedometer();

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
            gasPedal.disabled = true;
            gasPedal.classList.add('disabled-pedal');
            gasPedalStatus.textContent = 'Gas pedal disabled (TJA active)';
        } else {
            tjaStatusDisplay.textContent = 'TJA Disabled, Driver in Control';
            tjaStatusDisplay.classList.add('disabled');
            tjaStatusDisplay.classList.remove('enabled');
            gasPedal.disabled = false;
            gasPedal.classList.remove('disabled-pedal');
            gasPedalStatus.textContent = 'Release to slow down';
        }
    }

    // Function to update speedometer 
    function updateSpeedometer(){
        const kmh = Math.round(speed * speedtoKmh);
        speedDisplay.textContent = kmh;
    }

    // Gas pedal functionality
    gasPedal.addEventListener('mousedown', () => {
        if (!tjas) {
            gasPedalPressed = true;
            gasPedalStatus.textContent = 'Accelerating...';
        }
    });

    gasPedal.addEventListener('mouseup', () => {
        gasPedalPressed = false;
        gasPedalStatus.textContent = 'Release to slow down';
    });

    gasPedal.addEventListener('mouseleave', () => {
        gasPedalPressed = false;
        gasPedalStatus.textContent = 'Release to slow down';
    });

    updateFollowDistance();
    updateSpeed();
    updateDashboard();
    updateSpeedometer();
});
