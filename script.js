document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       1. NAVBAR SCROLL EFFECT
    ========================================= */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* =========================================
       2. SCROLL REVEAL ANIMATION
    ========================================= */
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(reveal => revealObserver.observe(reveal));

    /* =========================================
       3. HERO PARTICLES (Floating Leaves/Recycle)
    ========================================= */
    const particlesContainer = document.getElementById('particles-container');
    if (particlesContainer) {
        const particleIcons = ['fa-leaf', 'fa-recycle', 'fa-seedling'];
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Randomly select icon
            const randomIcon = particleIcons[Math.floor(Math.random() * particleIcons.length)];
            particle.innerHTML = `<i class="fa-solid ${randomIcon}"></i>`;
            
            // Randomize position, duration, and delay
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDuration = (Math.random() * 5 + 5) + 's';
            particle.style.animationDelay = Math.random() * 5 + 's';
            
            particlesContainer.appendChild(particle);
        }
    }

    /* =========================================
       4. WASTE CLASSIFICATION (DRAG & DROP)
    ========================================= */
    const dragItems = document.querySelectorAll('.drag-item');
    const dropBins = document.querySelectorAll('.drop-bin');

    dragItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.type);
            e.target.classList.add('dragging');
        });

        item.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    });

    dropBins.forEach(bin => {
        bin.addEventListener('dragover', (e) => {
            e.preventDefault(); // allow drop
            bin.classList.add('hovered');
        });

        bin.addEventListener('dragleave', () => {
            bin.classList.remove('hovered');
        });

        bin.addEventListener('drop', (e) => {
            e.preventDefault();
            bin.classList.remove('hovered');
            
            const draggedType = e.dataTransfer.getData('text/plain');
            const acceptedType = bin.dataset.accept;

            if (draggedType === acceptedType) {
                // Correct bin
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#27AE60', '#2D9CFF', '#FFD93D']
                });
                
                const draggingElement = document.querySelector('.dragging');
                if (draggingElement) {
                    draggingElement.style.opacity = '0';
                    setTimeout(() => draggingElement.style.display = 'none', 300);
                }

                bin.classList.add('success-bounce');
                setTimeout(() => bin.classList.remove('success-bounce'), 500);
            } else {
                // Wrong bin
                bin.classList.add('error-shake');
                setTimeout(() => bin.classList.remove('error-shake'), 500);
            }
        });
    });

    /* =========================================
       5. GAME 1: GUESS THE WASTE (QUIZ)
    ========================================= */
    const quizQuestions = [
        { icon: "fa-apple-whole", color: "green", q: "Sisa apel termasuk jenis sampah apa?", options: ["Organik", "Plastik", "Kertas", "Berbahaya"], ans: 0 },
        { icon: "fa-bottle-water", color: "blue", q: "Botol air plastik termasuk jenis sampah apa?", options: ["Kertas", "Berbahaya", "Plastik", "Organik"], ans: 2 },
        { icon: "fa-battery-full", color: "red", q: "Ke mana kamu harus membuang baterai bekas?", options: ["Berbahaya", "Kertas", "Organik", "Plastik"], ans: 0 },
        { icon: "fa-newspaper", color: "gray", q: "Koran bekas termasuk jenis sampah apa?", options: ["Plastik", "Organik", "Berbahaya", "Kertas"], ans: 3 },
        { icon: "fa-bag-shopping", color: "orange", q: "Bagaimana dengan kantong belanja plastik?", options: ["Organik", "Plastik", "Kertas", "Berbahaya"], ans: 1 }
    ];

    let currentQ = 0;
    let score = 0;
    let timerInterval;
    let timeLeft = 30;
    const maxTime = 30;

    const quizQuestionEl = document.getElementById('quiz-question');
    const quizImageEl = document.getElementById('quiz-image');
    const quizOptionsEl = document.getElementById('quiz-options');
    const quizScoreEl = document.getElementById('quiz-score');
    const quizTimerEl = document.getElementById('quiz-timer');
    const quizProgressEl = document.getElementById('quiz-progress');
    const quizContainer = document.getElementById('quiz-question-container');
    const quizResult = document.getElementById('quiz-result');
    const restartBtn = document.getElementById('btn-restart-quiz');
    const finalScoreEl = document.getElementById('final-score');

    function loadQuestion() {
        if (currentQ >= quizQuestions.length || timeLeft <= 0) {
            endQuiz();
            return;
        }

        const q = quizQuestions[currentQ];
        quizQuestionEl.textContent = q.q;
        quizImageEl.innerHTML = `<i class="fa-solid ${q.icon}" style="color: var(--primary-${q.color} , #2d3436);"></i>`;
        
        quizOptionsEl.innerHTML = '';
        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-option';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(index);
            quizOptionsEl.appendChild(btn);
        });
    }

    function checkAnswer(index) {
        if (index === quizQuestions[currentQ].ans) {
            score += 20;
            quizScoreEl.textContent = `Skor: ${score}`;
            confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.7 }
            });
        }
        currentQ++;
        loadQuestion();
    }

    function updateTimer() {
        timeLeft--;
        quizTimerEl.textContent = `Waktu: ${timeLeft}d`;
        
        // Update progress bar
        const percentage = (timeLeft / maxTime) * 100;
        quizProgressEl.style.width = `${percentage}%`;

        if (timeLeft <= 10) {
            quizProgressEl.style.background = 'var(--gradient-danger)';
            quizTimerEl.style.color = '#ff4757';
        }

        if (timeLeft <= 0) {
            endQuiz();
        }
    }

    function startQuiz() {
        currentQ = 0;
        score = 0;
        timeLeft = maxTime;
        quizScoreEl.textContent = `Skor: ${score}`;
        quizTimerEl.textContent = `Waktu: ${timeLeft}d`;
        quizTimerEl.style.color = 'white';
        quizProgressEl.style.width = '100%';
        quizProgressEl.style.background = 'var(--gradient-blue)';
        
        quizContainer.classList.remove('hidden');
        quizResult.classList.add('hidden');

        clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);
        
        loadQuestion();
    }

    function endQuiz() {
        clearInterval(timerInterval);
        quizContainer.classList.add('hidden');
        quizResult.classList.remove('hidden');
        finalScoreEl.textContent = `Kamu mendapatkan skor ${score} dari maksimal ${quizQuestions.length * 20}!`;
        
        if (score === 100) {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        }
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', startQuiz);
        startQuiz(); // Initialize on load
    }


    /* =========================================
       6. GAME 2: CONNECT WASTE TO BIN
    ========================================= */
    let selectedItem = null;
    const connectItems = document.querySelectorAll('.connect-item');
    const connectBins = document.querySelectorAll('.connect-bin');
    const svgContainer = document.getElementById('connect-lines');

    connectItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('connected')) return;
            
            // Remove previous selection
            connectItems.forEach(i => i.classList.remove('selected'));
            
            // Select new item
            item.classList.add('selected');
            selectedItem = item;
        });
    });

    connectBins.forEach(bin => {
        bin.addEventListener('click', () => {
            if (!selectedItem) return;
            
            const itemType = selectedItem.dataset.type;
            const binType = bin.dataset.type;

            if (itemType === binType) {
                // Correct Connection
                drawLine(selectedItem, bin);
                selectedItem.classList.remove('selected');
                selectedItem.classList.add('connected');
                selectedItem = null;
                
                confetti({
                    particleCount: 40,
                    spread: 60,
                    origin: { y: 0.8 }
                });
            } else {
                // Wrong Connection
                bin.classList.add('error-shake');
                setTimeout(() => bin.classList.remove('error-shake'), 500);
            }
        });
    });

    function drawLine(el1, el2) {
        if (!svgContainer) return;
        
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();
        const svgRect = svgContainer.getBoundingClientRect();

        // Calculate center points relative to SVG container
        const x1 = rect1.left + rect1.width / 2 - svgRect.left;
        const y1 = rect1.top + rect1.height / 2 - svgRect.top;
        const x2 = rect2.left + rect2.width / 2 - svgRect.left;
        const y2 = rect2.top + rect2.height / 2 - svgRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#27AE60');
        line.setAttribute('stroke-width', '4');
        line.setAttribute('stroke-dasharray', '8');
        line.style.animation = 'dash 1s linear infinite';
        
        // Add animation style dynamically
        if(!document.getElementById('svg-anim-style')){
            const style = document.createElement('style');
            style.id = 'svg-anim-style';
            style.innerHTML = `@keyframes dash { to { stroke-dashoffset: -16; } }`;
            document.head.appendChild(style);
        }

        svgContainer.appendChild(line);
    }

    // Reset lines on window resize to maintain visual integrity
    window.addEventListener('resize', () => {
        if (svgContainer) {
            svgContainer.innerHTML = '';
            connectItems.forEach(i => {
                i.classList.remove('connected');
                i.classList.remove('selected');
            });
            selectedItem = null;
        }
    });

    /* =========================================
       7. ANIMATED COUNTERS (DASHBOARD)
    ========================================= */
    const counters = document.querySelectorAll('.counter, .counter-percent');
    
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetEl = entry.target;
                const targetNum = +targetEl.getAttribute('data-target');
                
                const updateCount = () => {
                    // Extract current number, ignoring non-digits (for safety)
                    let currentNum = +targetEl.innerText.replace(/,/g, '');
                    
                    // Determine speed/increment
                    const increment = targetNum / 50; 

                    if (currentNum < targetNum) {
                        currentNum += increment;
                        // Format numbers gracefully
                        targetEl.innerText = Math.ceil(currentNum).toLocaleString('id-ID'); // Use Indonesian locale for formatting
                        setTimeout(updateCount, 30);
                    } else {
                        targetEl.innerText = targetNum.toLocaleString('id-ID'); // Use Indonesian locale
                    }
                };
                
                updateCount();
                observer.unobserve(targetEl);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

});
