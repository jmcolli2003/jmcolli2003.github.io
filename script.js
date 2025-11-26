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
    const brakePedal = document.getElementById('brake-pedal');

    let speed = 0;
    let cruiseSpeed = 0;
    let frontCarSpeed = 0;
    let offset = 0;
    let followDistance = 'medium'; // default
    let running = false;
    let animationId;

    let tjas = false;
    let cruise = false;
    let lane = false;

    let gasPedalPressed = false;
    let brakePedalPressed = false;
    let baseSpeed = 0; // base speed from systems
    let acceleration = 0; // additional speed from gas pedal

    // State variables
    let frontVehicleBraking = false;
    let stopAndGoActive = false;
    let stopAndGoInterval = null;
    let handsOnWheel = true;
    let sensorsEnabled = true;

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
        if (stopAndGoInterval) {
            clearInterval(stopAndGoInterval);
            stopAndGoInterval = null;
        }
    };

    // Check for a collision condition
    function checkCollisionImminent() {
        // Collision is imminent, show the warning
        if (!tjas && running && frontVehicleBraking && speed > 0) {
            showCollisionWarning();
        }
    }

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
        cruiseSpeed = speed;
        document.getElementById('toggle-cruise').classList.toggle('toggle-active', cruise);
    };

    document.getElementById('toggle-lane').onclick = () => {
        lane = !lane;
        document.getElementById('toggle-lane').classList.toggle('toggle-active', lane);
    };

    // Front vehicle brakes button
    document.getElementById('trigger-brake').onclick = () => {
        frontVehicleBraking = !frontVehicleBraking;
        const button = document.getElementById('trigger-brake');
        
        if (frontVehicleBraking) {
            button.textContent = 'Resume Lead Vehicle';
            button.classList.add('toggle-active');
        } else {
            button.textContent = 'Lead Vehicle Brakes';
            button.classList.remove('toggle-active');
        }
        
        updateSpeed();
        checkCollisionImminent();
    };

    // Toggle Stop & Go button
    document.getElementById('toggle-stopgo').onclick = () => {
        stopAndGoActive = !stopAndGoActive;
        const button = document.getElementById('toggle-stopgo');
        
        if (stopAndGoActive) {
            button.textContent = 'Stop & Go Active';
            button.classList.add('toggle-active');
            startStopAndGo();
        } else {
            button.textContent = 'Toggle Stop & Go';
            button.classList.remove('toggle-active');
            stopStopAndGo();
        }
    };

    // Remove hands from wheel button
    document.getElementById('remove-hands').onclick = () => {
        handsOnWheel = !handsOnWheel;
        const button = document.getElementById('remove-hands');
        
        if (!handsOnWheel) {
            button.textContent = 'Place Hands on Wheel';
            button.classList.add('toggle-active');
            
            // Deactivate TJA if hands are removed
            if (tjas) {
                tjas = false;
                document.getElementById('toggle-tjas').classList.remove('toggle-active');
                followDistanceControls.style.display = "none";
                updateDashboard();
                updateSpeed();
                checkCollisionImminent();
            }
        } else {
            button.textContent = 'Remove Hands from Wheel';
            button.classList.remove('toggle-active');
        }
    };

    // Disable sensors button
    document.getElementById('toggle-sensors').onclick = () => {
        sensorsEnabled = !sensorsEnabled;
        const button = document.getElementById('toggle-sensors');
        
        if (!sensorsEnabled) {
            button.textContent = 'Enable Sensors';
            button.classList.add('toggle-active');
            
            // Deactivate TJA if sensors are disabled
            if (tjas) {
                tjas = false;
                document.getElementById('toggle-tjas').classList.remove('toggle-active');
                followDistanceControls.style.display = "none";
                updateDashboard();
                updateSpeed();
                checkCollisionImminent();
            }
        } else {
            button.textContent = 'Disable Sensors';
            button.classList.remove('toggle-active');
        }
    };

    // Function to start stop and go traffic pattern
    function startStopAndGo() {
        let cyclePhase = 0; // 0 = slow down, 1 = speed up
        
        stopAndGoInterval = setInterval(() => {
            if (cyclePhase === 0) {
                // Slow down phase
                frontVehicleBraking = true;
                cyclePhase = 1;
            } else {
                // Speed up phase
                frontVehicleBraking = false;
                cyclePhase = 0;
            }
            updateSpeed();
        }, 3000); // Change every 3 seconds
    }

    // Function to stop stop and go pattern
    function stopStopAndGo() {
        if (stopAndGoInterval) {
            clearInterval(stopAndGoInterval);
            stopAndGoInterval = null;
        }
        frontVehicleBraking = false;
        updateSpeed();
    }

    // Show collision warning overlay
    function showCollisionWarning() {
        // Check if warning already exists
        if (document.getElementById('collision-warning')) return;
        
        // Stop the simulation
        running = false;
        cancelAnimationFrame(animationId);
        
        // Change car colors to indicate danger
        mainCar.style.backgroundColor = '#ff0000';
        frontCar.style.backgroundColor = '#ff0000';
        
        const warning = document.createElement('div');
        warning.id = 'collision-warning';
        warning.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(255, 0, 0, 0.95);
            color: white;
            padding: 40px 60px;
            border-radius: 10px;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            z-index: 1000;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
            border: 3px solid white;
        `;
        
        warning.innerHTML = `
            <div style="margin-bottom: 20px;">⚠️ COLLISION IMMINENT ⚠️</div>
            <div style="font-size: 18px; margin-bottom: 30px;">
                TJA is disabled while lead vehicle is braking!<br>
                Driver must take immediate action to avoid collision.
            </div>
            <button id="acknowledge-button" style="
                background-color: white;
                color: #ff0000;
                border: none;
                padding: 15px 40px;
                font-size: 20px;
                font-weight: bold;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s;
            ">ACKNOWLEDGE</button>
        `;
        
        document.body.appendChild(warning);
        
        // Add acknowledge button functionality
        document.getElementById('acknowledge-button').onclick = () => {
            warning.remove();
            // Reset car colors
            mainCar.style.backgroundColor = '';
            frontCar.style.backgroundColor = '';
        };
        
        // Add hover effect to button
        const ackBtn = document.getElementById('acknowledge-button');
        ackBtn.onmouseover = () => {
            ackBtn.style.backgroundColor = '#ffcccc';
        };
        ackBtn.onmouseout = () => {
            ackBtn.style.backgroundColor = 'white';
        };
    }

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
        if(running && !brakePedalPressed)
        {
            // If TJA is active, match the front vehicle's behavior
            if (tjas) {
                if (frontVehicleBraking) {
                    baseSpeed = 0; // TJA stops when front car brakes
                } else {
                    baseSpeed = 1;
                }
            } else {
                // If TJA is NOT active, car continues at current speed regardless of front vehicle
                // This will cause collision if front vehicle is braking
                baseSpeed = 1;
            }
        }
        else
        {
            baseSpeed = 0;
        }
    }

    function animate() {
        if (!running) return;

        // Handle gas pedal acceleration
        if (gasPedalPressed && !tjas) {
            acceleration = Math.min(acceleration + 0.01, 5); // Max boost of 5 units
        } 

        if (brakePedalPressed) 
        {
            baseSpeed = Math.max(baseSpeed - 0.01, 0);
            acceleration = Math.max(acceleration - 0.01, 0);
        }

        // Calculate total speed including acceleration
        speed = baseSpeed + acceleration;
        const kmh = Math.round(speed * speedtoKmh);
        speedDisplay.textContent = kmh;

        // Move the road lines based on speed
        offset += speed;
        lanes.forEach(lane => {
            lane.style.backgroundPositionX = `-${offset}px`;
        });

        // Move car when gas pedal is pressed (and TJA is off)
        if (gasPedalPressed && !tjas) {
            const mainCarRect = mainCar.getBoundingClientRect();
            const roadRect = document.getElementById('road').getBoundingClientRect();
            let currentLeft = mainCarRect.left - roadRect.left;
            let newLeft = currentLeft + (acceleration * 0.6);
            let newLeftPercent = (newLeft / roadRect.width) * 100;
            
            if (newLeftPercent < 90) {
                mainCar.style.left = `${newLeftPercent}%`;
            }
        }
       
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

    // Brake pedal functionality
    brakePedal.addEventListener('mousedown', () => {
        brakePedalPressed = true;
        if (tjas || cruise) {
            tjas = false;
            cruise = false;

            document.getElementById('toggle-tjas').classList.toggle('toggle-active', tjas);
            followDistanceControls.style.display = "none";
            document.getElementById('toggle-cruise').classList.toggle('toggle-active', cruise);
        }
        updateDashboard();
    });

    brakePedal.addEventListener('mouseup', () => {
        brakePedalPressed = false;
    });

    brakePedal.addEventListener('mouseleave', () => {
        brakePedalPressed = false;
    });

    updateFollowDistance();
    updateSpeed();
    updateDashboard();
    updateSpeed();
});