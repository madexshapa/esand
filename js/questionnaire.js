// eSand Questionnaire Logic
// Handles 3-question flow with progressive discount unlocking

// State management
const state = {
    currentQuestion: 1,
    answers: {
        personality: null,
        socialClass: null,
        engagement: null,
        firstName: '',
        email: '',
        country: ''
    },
    discount: 0,
    discountHistory: {
        afterQ1: 0,  // Discount after Q1 (5 if answered, 0 if skipped)
        afterQ2: 0,  // Discount after Q2 (adds 5 if answered)
        afterQ3: 0   // Discount after Q3 (adds 5 if answered)
    }
};

// Question 2 options based on personality type
const question2Data = {
    thinker: {
        title: "Which best describes your current situation?",
        subtitle: "As someone who values logic and understanding, which scenario fits you?",
        options: [
            { emoji: "🥖", label: "Working Class", value: "working", desc: "I'm building my foundation and looking for smart opportunities" },
            { emoji: "🧑‍🔧", label: "Middle Class", value: "middle", desc: "I have stable income and ready to diversify my portfolio" },
            { emoji: "👑", label: "Elite Class", value: "elite", desc: "I manage significant capital and seek premium opportunities" }
        ]
    },
    persister: {
        title: "Which best describes your investment approach?",
        subtitle: "As someone who values commitment and principles, where do you stand?",
        options: [
            { emoji: "🥖", label: "Working Class", value: "working", desc: "I'm committed to building wealth systematically" },
            { emoji: "🧑‍🔧", label: "Middle Class", value: "middle", desc: "I'm dedicated to growing my established portfolio" },
            { emoji: "👑", label: "Elite Class", value: "elite", desc: "I'm focused on preserving and multiplying significant wealth" }
        ]
    },
    harmoniser: {
        title: "Which community do you identify with?",
        subtitle: "As someone who values relationships and impact, where do you belong?",
        options: [
            { emoji: "🥖", label: "Working Class", value: "working", desc: "I care about my community and our collective growth" },
            { emoji: "🧑‍🔧", label: "Middle Class", value: "middle", desc: "I want to support positive change while growing financially" },
            { emoji: "👑", label: "Elite Class", value: "elite", desc: "I seek meaningful investments that create lasting impact" }
        ]
    },
    promoter: {
        title: "What's your current financial position?",
        subtitle: "As someone who loves action and winning, where are you now?",
        options: [
            { emoji: "🥖", label: "Working Class", value: "working", desc: "I'm ready to jump on opportunities and grow fast" },
            { emoji: "🧑‍🔧", label: "Middle Class", value: "middle", desc: "I'm positioned to seize significant opportunities" },
            { emoji: "👑", label: "Elite Class", value: "elite", desc: "I have resources to pursue premium opportunities" }
        ]
    },
    rebel: {
        title: "How would you describe your financial style?",
        subtitle: "As someone who likes spontaneity and fun, what fits you?",
        options: [
            { emoji: "🥖", label: "Working Class", value: "working", desc: "I'm flexible and looking for exciting opportunities" },
            { emoji: "🧑‍🔧", label: "Middle Class", value: "middle", desc: "I have freedom to explore unconventional investments" },
            { emoji: "👑", label: "Elite Class", value: "elite", desc: "I enjoy unique, high-level opportunities" }
        ]
    },
    imaginer: {
        title: "Where do you see yourself in this vision?",
        subtitle: "As someone drawn to innovation and possibilities, what describes you?",
        options: [
            { emoji: "🥖", label: "Working Class", value: "working", desc: "I'm dreaming big and starting my journey" },
            { emoji: "🧑‍🔧", label: "Middle Class", value: "middle", desc: "I'm ready to invest in transformative opportunities" },
            { emoji: "👑", label: "Elite Class", value: "elite", desc: "I seek visionary investments at scale" }
        ]
    }
};

// DOM Elements
const progressFill = document.getElementById('progressFill');
const discountBadge = document.getElementById('discountBadge');
const backButtons = {
    btn1: document.getElementById('backBtn1'),
    btn2: document.getElementById('backBtn2'),
    btn3: document.getElementById('backBtn3'),
    btn4: document.getElementById('backBtn4')
};
const questions = document.querySelectorAll('.question');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupQuestion1();
    setupBackButton();
    setupSkipButtons();
    setupEmailCapture(); // Set up email capture once on page load
});

// Question 1: Personality Type
function setupQuestion1() {
    const options = document.querySelectorAll('#question1 .option');

    options.forEach(option => {
        option.addEventListener('click', () => {
            // Remove previous selection
            options.forEach(opt => opt.classList.remove('selected'));

            // Select current
            option.classList.add('selected');

            // Clear subsequent answers if personality changes
            if (state.answers.personality !== option.dataset.value) {
                state.answers.socialClass = null;
                state.answers.engagement = null;
            }

            state.answers.personality = option.dataset.value;

            // Auto-advance after short delay
            setTimeout(() => {
                state.discountHistory.afterQ1 = 5; // Track Q1 discount
                updateProgress(33, 5); // Q1 gives 5% discount
                loadQuestion2();
                showQuestion(2);
            }, 300);
        });
    });
}

// Question 2: Social Class (Dynamic)
function loadQuestion2() {
    const personality = state.answers.personality;
    const data = question2Data[personality];

    // Update title and subtitle
    document.getElementById('question2Title').textContent = data.title;
    document.getElementById('question2Subtitle').textContent = data.subtitle;

    // Build options
    const optionsContainer = document.getElementById('question2Options');
    optionsContainer.innerHTML = '';

    data.options.forEach(optionData => {
        const option = document.createElement('div');
        option.className = 'option';
        option.dataset.value = optionData.value;
        option.innerHTML = `
            <p>${optionData.desc}</p>
        `;
        optionsContainer.appendChild(option);
    });

    // Hide skip button on Q2 if Q1 was answered
    const skipBtn2 = document.getElementById('skipQuestion2');
    if (skipBtn2 && state.answers.personality) {
        skipBtn2.style.display = 'none';
    }

    setupQuestion2();
}

function setupQuestion2() {
    const options = document.querySelectorAll('#question2 .option');

    options.forEach(option => {
        option.addEventListener('click', () => {
            // Remove previous selection
            options.forEach(opt => opt.classList.remove('selected'));

            // Select current
            option.classList.add('selected');

            // Clear subsequent answers if socialClass changes
            if (state.answers.socialClass !== option.dataset.value) {
                state.answers.engagement = null;
            }

            state.answers.socialClass = option.dataset.value;

            // Auto-advance after short delay
            setTimeout(() => {
                // Q2 adds 5% discount to Q1's discount (5% → 10%)
                const newDiscount = Math.min(state.discountHistory.afterQ1 + 5, 15);
                state.discountHistory.afterQ2 = newDiscount; // Track Q2 discount
                updateProgress(66, newDiscount);
                setupQuestion3();
                showQuestion(3);
            }, 300);
        });
    });
}

// Question 3: Engagement Option
function setupQuestion3() {
    const options = document.querySelectorAll('#question3 .option');

    options.forEach(option => {
        option.addEventListener('click', () => {
            // Remove previous selection
            options.forEach(opt => opt.classList.remove('selected'));

            // Select current
            option.classList.add('selected');
            state.answers.engagement = option.dataset.value;

            // Auto-advance after short delay
            setTimeout(() => {
                // Q3 adds 5% discount to Q2's discount (10% → 15%, or 0% → 5% if Q1 and Q2 were skipped)
                const newDiscount = Math.min(state.discountHistory.afterQ2 + 5, 15);
                state.discountHistory.afterQ3 = newDiscount; // Track Q3 discount
                updateProgress(100, newDiscount);
                showQuestion(4);
            }, 300);
        });
    });
}

// Email Capture
let emailCaptureSetup = false; // Prevent multiple listener attachments
function setupEmailCapture() {
    if (emailCaptureSetup) return; // Already set up

    const form = document.getElementById('emailForm');
    if (!form) return; // Form not in DOM yet

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect form data
        state.answers.firstName = document.getElementById('firstName').value;
        state.answers.email = document.getElementById('email').value;
        state.answers.country = document.getElementById('country').value;

        // Save to localStorage
        localStorage.setItem('eSandProfile', JSON.stringify(state.answers));
        localStorage.setItem('eSandDiscount', state.discount);

        // Redirect to index page with personalization (if available)
        if (state.answers.personality && state.answers.socialClass) {
            window.location.href = `index.html?personality=${state.answers.personality}&class=${state.answers.socialClass}`;
        } else {
            // If user skipped questions, redirect to generic index page
            window.location.href = 'index.html';
        }
    });

    emailCaptureSetup = true;
}

// Helper Functions
function showQuestion(num) {
    // Remove active from all questions
    questions.forEach(q => q.classList.remove('active'));

    // Determine target ID - Fixed: don't add 'question' prefix for emailCapture
    const targetId = num === 4 ? 'emailCapture' : `question${num}`;

    // Get target element and add active class
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.classList.add('active');
    }

    // Update email capture title with actual discount
    if (num === 4) {
        const emailTitle = document.getElementById('emailCaptureTitle');
        const upgradeMessage = document.getElementById('upgradeMessage');

        if (emailTitle) {
            emailTitle.textContent = `Claim Your ${state.discount}% Discount`;
        }

        // Show upgrade message if discount is less than 15%
        if (upgradeMessage && state.discount < 15) {
            upgradeMessage.style.display = 'block';
        } else if (upgradeMessage) {
            upgradeMessage.style.display = 'none';
        }
    }

    state.currentQuestion = num;

    // Show/hide back buttons for each question
    // Q1: hide back button (it's the first question)
    // Q2, Q3, Q4: show back button
    if (backButtons.btn1) backButtons.btn1.style.display = 'none';
    if (backButtons.btn2) backButtons.btn2.style.display = num >= 2 ? 'block' : 'none';
    if (backButtons.btn3) backButtons.btn3.style.display = num >= 3 ? 'block' : 'none';
    if (backButtons.btn4) backButtons.btn4.style.display = num >= 4 ? 'block' : 'none';
}

function updateProgress(percentage, discount) {
    progressFill.style.width = `${percentage}%`;
    state.discount = discount;

    // Show "EARN UP TO 15% OFF" when no discount yet, otherwise show current discount
    if (discount === 0) {
        discountBadge.textContent = `EARN UP TO 15% OFF`;
    } else {
        discountBadge.textContent = `UNLOCK ${discount}% OFF`;
    }
}

function setupBackButton() {
    const handleBack = () => {
        if (state.currentQuestion > 1) {
            let prevQuestion = state.currentQuestion - 1;

            // Smart navigation: skip questions that weren't answered
            if (state.currentQuestion === 3) {
                // If on Q3, check if we should go to Q1 or Q2
                if (!state.answers.personality) {
                    // Q1 was skipped, go back to Q1
                    prevQuestion = 1;
                } else if (!state.answers.socialClass) {
                    // Q2 was skipped, go back to Q1
                    prevQuestion = 1;
                } else {
                    // Normal flow, go back to Q2
                    prevQuestion = 2;
                }
            } else if (state.currentQuestion === 4) {
                // If on email capture, go back to Q3
                prevQuestion = 3;
            }

            // Update progress and discount based on previous question
            // Show the discount earned UP TO AND INCLUDING that question
            if (prevQuestion === 1) {
                // Show discount after Q1 (5% if answered, 0% if not)
                updateProgress(0, state.discountHistory.afterQ1);
            } else if (prevQuestion === 2) {
                // Show discount after Q2 (includes Q1+Q2 or just Q1 if Q2 skipped)
                updateProgress(33, state.discountHistory.afterQ2);
            } else if (prevQuestion === 3) {
                // Show discount after Q3 (includes all earned discounts)
                updateProgress(66, state.discountHistory.afterQ3);
            }

            showQuestion(prevQuestion);
        }
    };

    // Add click listeners to all back buttons
    if (backButtons.btn1) backButtons.btn1.addEventListener('click', handleBack);
    if (backButtons.btn2) backButtons.btn2.addEventListener('click', handleBack);
    if (backButtons.btn3) backButtons.btn3.addEventListener('click', handleBack);
    if (backButtons.btn4) backButtons.btn4.addEventListener('click', handleBack);
}

function setupSkipButtons() {
    // Skip Question 1 - reset to 0% discount, go straight to Q3
    document.getElementById('skipQuestion1').addEventListener('click', () => {
        // Remove selected class from Q1 options
        document.querySelectorAll('#question1 .option').forEach(opt => opt.classList.remove('selected'));

        // Clear Q1 and Q2 answers when skipping Q1
        state.answers.personality = null;
        state.answers.socialClass = null;

        state.discountHistory.afterQ1 = 0; // Track that Q1 was skipped
        state.discountHistory.afterQ2 = 0; // Also skip Q2 since it depends on Q1
        state.discount = 0; // Reset discount to 0%
        updateProgress(66, 0); // Reset to 0% discount
        setupQuestion3();
        showQuestion(3);
    });

    // Skip Question 2 - keep discount from Q1 only
    document.getElementById('skipQuestion2').addEventListener('click', () => {
        // Remove selected class from Q2 options
        document.querySelectorAll('#question2 .option').forEach(opt => opt.classList.remove('selected'));

        // Clear Q2 answer when skipping Q2
        state.answers.socialClass = null;

        // When skipping Q2, only keep Q1's discount (lose Q2's 5%)
        state.discountHistory.afterQ2 = state.discountHistory.afterQ1;
        updateProgress(66, state.discountHistory.afterQ1);
        setupQuestion3();
        showQuestion(3);
    });

    // Skip Question 3 - keep discount from Q1/Q2 only
    document.getElementById('skipQuestion3').addEventListener('click', () => {
        // Remove selected class from Q3 options
        document.querySelectorAll('#question3 .option').forEach(opt => opt.classList.remove('selected'));

        // Clear Q3 answer when skipping Q3
        state.answers.engagement = null;

        // When skipping Q3, only keep Q1+Q2's discount (lose Q3's 5%)
        state.discountHistory.afterQ3 = state.discountHistory.afterQ2;

        // If user skipped all 3 questions, redirect to index without email form
        if (!state.answers.personality && !state.answers.socialClass && !state.answers.engagement) {
            // Save minimal data to localStorage
            localStorage.setItem('eSandDiscount', state.discountHistory.afterQ2);
            // Redirect directly to index page
            window.location.href = 'index.html';
        } else {
            // Show email form if at least one question was answered
            updateProgress(100, state.discountHistory.afterQ2);
            showQuestion(4);
        }
    });
}
