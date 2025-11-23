// Resume Data
const resumeData = {
    about: {
        title: "About Me",
        content: `I have been supporting networks for more than 12 years: monitoring, troubleshooting and security. Also configured VPC virtual networks and VPN's in cloud infrastructures using virtual routers: VyOS, RouterOS. I like what I do.`
    },
    education: [
        {
            degree: "Master's degree, Electronic Engineer",
            institution: "Ukrainian State University of Railway Transport (UkrSURT), Kharkiv",
            date: "2010 - 2013"
        },
        {
            degree: "Diploma of Specialist, Engineer",
            institution: "Uzhhorod State University, Uzhhorod",
            date: "2003 - 2008"
        }
    ],
    skills: [
        { name: "Protocol TCP/IP (IPv4, IPv6)", level: 10 },
        { name: "Network Services", level: 9 },
        { name: "Network Security", level: 9 },
        { name: "Routing Protocols", level: 9 },
        { name: "Cisco IOS", level: 8 },
        { name: "RouterOS", level: 9 },
        { name: "JunOS", level: 7 },
        { name: "VyOS", level: 9 },
        { name: "Debian, Ubuntu OS", level: 8 },
        { name: "Windows OS", level: 8 },
        { name: "Cloud AWS, Azure, Google Cloud", level: 7 },
        { name: "Programming Python", level: 6 },
        { name: "Troubleshooting", level: 10 },
        { name: "Monitoring", level: 9 }
    ],
    experience: [
        {
            title: "Network Engineer",
            company: 'JSC "Ukrainian Railway" Branch "Main Information and Computing Center"',
            date: "2008 - 2021",
            responsibilities: [
                "Design and laying local networks of any configuration on railway stations and offices of enterprises (last mile).",
                "Maintenance of technical documentation.",
                "Creation of physical and logical schemes of networks.",
                "Configuration of routers (Cisco, MikroTik)."
            ]
        }
    ],
    languages: [
        { name: "Ukrainian", level: "native" },
        { name: "English", level: "intermediate" },
        { name: "Russian", level: "proficiency" }
    ]
};

// Terminal State
let commandHistory = [];
let historyIndex = -1;
let isResumeVisible = false;

// Available commands for tab completion
const availableCommands = [
    'show',
    'show all',
    'show about',
    'show education',
    'show skill',
    'show skills',
    'show experience',
    'show help',
    'help',
    'clear',
    'cls'
];

// DOM Elements
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const resumeContent = document.getElementById('resume-content');

// Initialize Terminal
function initTerminal() {
    // Show welcome message
    addOutputLine("Welcome! To view the entire resume, type <span class='command'>show all</span>. For help, type <span class='command'>show help</span>", "welcome");
    
    // Focus on input
    terminalInput.focus();
    
    // Handle input
    terminalInput.addEventListener('keydown', handleKeyDown);
}

// Tab completion function
function tabComplete(input) {
    const trimmed = input.trim();
    const words = trimmed.split(/\s+/);
    const currentWord = words[words.length - 1] || '';
    const prefix = words.slice(0, -1).join(' ');
    
    // Check if input ends with space (user wants to see available options)
    const endsWithSpace = input.endsWith(' ') && input.trim().length > 0;
    
    if (endsWithSpace && words.length > 0) {
        // User typed a word with space, show all commands starting with that word
        const firstWord = words[0].toLowerCase();
        const matchingCommands = availableCommands.filter(cmd => {
            const cmdWords = cmd.split(' ');
            return cmdWords[0] === firstWord && cmdWords.length > 1;
        });
        
        if (matchingCommands.length > 0) {
            const helpText = `Available commands:<br><br>${matchingCommands.map(cmd => {
                const cmdParts = cmd.split(' ');
                const description = getCommandDescription(cmd);
                return `  <span class="command">${cmd}</span> - ${description}`;
            }).join('<br>')}`;
            addOutputLine(helpText, 'info');
            return input; // Don't change input
        }
    }
    
    // Find matching commands
    const matches = availableCommands.filter(cmd => {
        const cmdWords = cmd.split(' ');
        if (words.length === 1 || (words.length === 2 && words[1] === '')) {
            // First word completion
            return cmdWords[0].startsWith(currentWord.toLowerCase());
        } else if (words.length === 2) {
            // Second word completion
            if (cmdWords.length >= 2) {
                return cmdWords[0] === words[0].toLowerCase() && 
                       cmdWords[1].startsWith(currentWord.toLowerCase());
            }
        }
        return false;
    });
    
    if (matches.length === 1) {
        // Single match - complete it
        const match = matches[0];
        const matchWords = match.split(' ');
        if (words.length === 1 || (words.length === 2 && words[1] === '')) {
            // If command has multiple words, add space after first word
            if (matchWords.length > 1) {
                return matchWords[0] + ' ';
            }
            return matchWords[0];
        } else {
            return prefix + ' ' + matchWords[1];
        }
    } else if (matches.length > 1) {
        // Check if all matches start with the same first word
        const firstWords = matches.map(m => m.split(' ')[0]);
        const uniqueFirstWords = [...new Set(firstWords)];
        
        if (uniqueFirstWords.length === 1 && (words.length === 1 || (words.length === 2 && words[1] === ''))) {
            // All matches start with the same word - complete it automatically
            // Check if any match has multiple words, then add space
            const hasMultipleWords = matches.some(m => m.split(' ').length > 1);
            if (hasMultipleWords) {
                return uniqueFirstWords[0] + ' ';
            }
            return uniqueFirstWords[0];
        } else {
            // Multiple matches - show possibilities
            addOutputLine(`<span class="info">Possible completions:</span><br>${matches.map(m => `  ${m}`).join('<br>')}`, 'info');
            return input; // Don't change input
        }
    }
    
    return input; // No match found
}

// Get command description for help
function getCommandDescription(cmd) {
    const descriptions = {
        'show all': 'Display entire resume',
        'show about': 'Display about me section',
        'show education': 'Display education section',
        'show skill': 'Display skills section',
        'show skills': 'Display skills section',
        'show experience': 'Display experience section',
        'show help': 'Display this help message',
        'help': 'Display this help message',
        'clear': 'Clear terminal',
        'cls': 'Clear terminal'
    };
    return descriptions[cmd] || '';
}

// Handle keyboard input
function handleKeyDown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const command = terminalInput.value.trim();
        if (command) {
            executeCommand(command);
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            terminalInput.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentValue = terminalInput.value;
        const completed = tabComplete(currentValue);
        terminalInput.value = completed;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            terminalInput.value = '';
        }
    }
}

// Add output line to terminal
function addOutputLine(text, className = '') {
    const line = document.createElement('div');
    line.className = `output-line ${className}`;
    line.innerHTML = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Execute command
function executeCommand(command) {
    // Echo the command
    addOutputLine(`<span class="prompt">root@console:~#</span> ${command}`, 'command');
    
    const cmd = command.toLowerCase().trim();
    
    if (cmd === 'show all') {
        showAllResume();
    } else if (cmd === 'show about') {
        showAbout();
    } else if (cmd === 'show education') {
        showEducation();
    } else if (cmd === 'show skill' || cmd === 'show skills') {
        showSkills();
    } else if (cmd === 'show experience') {
        showExperience();
    } else if (cmd === 'show help' || cmd === 'help') {
        showHelp();
    } else if (cmd === 'clear' || cmd === 'cls') {
        clearTerminal();
    } else {
        addOutputLine(`<span class="error">Command not found: ${command}</span><br>Type <span class="command">show help</span> for available commands.`, 'error');
    }
}

// Show help
function showHelp() {
    const helpText = `
Available commands:<br>
  <span class="command">show all</span> - Display entire resume<br>
  <span class="command">show about</span> - Display about me section<br>
  <span class="command">show education</span> - Display education section<br>
  <span class="command">show skill</span> - Display skills section<br>
  <span class="command">show experience</span> - Display experience section<br>
  <span class="command">show help</span> - Display this help message<br>
  <span class="command">clear</span> - Clear terminal
    `;
    addOutputLine(helpText, 'info');
}

// Clear terminal
function clearTerminal() {
    terminalOutput.innerHTML = '';
    isResumeVisible = false;
    resumeContent.innerHTML = '';
    resumeContent.style.display = 'none';
}

// Show all resume sections
function showAllResume() {
    addOutputLine('<span class="info">Displaying full resume...</span>', 'info');
    resumeContent.innerHTML = '';
    resumeContent.style.display = 'block';
    
    // About
    resumeContent.appendChild(createAboutSection());
    
    // Education
    resumeContent.appendChild(createEducationSection());
    
    // Skills
    resumeContent.appendChild(createSkillsSection());
    
    // Experience
    resumeContent.appendChild(createExperienceSection());
    
    isResumeVisible = true;
    
    // Scroll to resume
    setTimeout(() => {
        resumeContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Show about section
function showAbout() {
    addOutputLine('<span class="info">Displaying About Me section...</span>', 'info');
    resumeContent.innerHTML = '';
    resumeContent.style.display = 'block';
    resumeContent.appendChild(createAboutSection());
    isResumeVisible = true;
    
    setTimeout(() => {
        resumeContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Show education section
function showEducation() {
    addOutputLine('<span class="info">Displaying Education section...</span>', 'info');
    resumeContent.innerHTML = '';
    resumeContent.style.display = 'block';
    resumeContent.appendChild(createEducationSection());
    isResumeVisible = true;
    
    setTimeout(() => {
        resumeContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Show skills section
function showSkills() {
    addOutputLine('<span class="info">Displaying Skills section...</span>', 'info');
    resumeContent.innerHTML = '';
    resumeContent.style.display = 'block';
    resumeContent.appendChild(createSkillsSection());
    isResumeVisible = true;
    
    setTimeout(() => {
        resumeContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Show experience section
function showExperience() {
    addOutputLine('<span class="info">Displaying Experience section...</span>', 'info');
    resumeContent.innerHTML = '';
    resumeContent.style.display = 'block';
    resumeContent.appendChild(createExperienceSection());
    isResumeVisible = true;
    
    setTimeout(() => {
        resumeContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Create About section
function createAboutSection() {
    const section = document.createElement('div');
    section.className = 'resume-section';
    section.innerHTML = `
        <h2>About Me</h2>
        <p>${resumeData.about.content}</p>
    `;
    return section;
}

// Create Education section
function createEducationSection() {
    const section = document.createElement('div');
    section.className = 'resume-section';
    section.innerHTML = '<h2>Education</h2>';
    
    resumeData.education.forEach(edu => {
        const eduDiv = document.createElement('div');
        eduDiv.className = 'education-item';
        eduDiv.innerHTML = `
            <div class="degree-title">${edu.degree}</div>
            <div class="institution">${edu.institution}</div>
            <div class="date">${edu.date}</div>
        `;
        section.appendChild(eduDiv);
    });
    
    return section;
}

// Create Skills section
function createSkillsSection() {
    const section = document.createElement('div');
    section.className = 'resume-section';
    section.innerHTML = '<h2>Skills</h2>';
    
    const skillsGrid = document.createElement('div');
    skillsGrid.className = 'skills-grid';
    
    resumeData.skills.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        const percentage = (skill.level / 10) * 100;
        skillItem.innerHTML = `
            <div class="skill-name">
                <span>${skill.name}</span>
                <span>${skill.level}/10</span>
            </div>
            <div class="skill-bar">
                <div class="skill-progress" style="width: ${percentage}%"></div>
            </div>
        `;
        skillsGrid.appendChild(skillItem);
    });
    
    section.appendChild(skillsGrid);
    
    // Add Languages
    section.innerHTML += '<h3>Languages</h3>';
    const langList = document.createElement('ul');
    resumeData.languages.forEach(lang => {
        const li = document.createElement('li');
        li.textContent = `${lang.name}: ${lang.level}`;
        langList.appendChild(li);
    });
    section.appendChild(langList);
    
    return section;
}

// Create Experience section
function createExperienceSection() {
    const section = document.createElement('div');
    section.className = 'resume-section';
    section.innerHTML = '<h2>Experience</h2>';
    
    resumeData.experience.forEach(exp => {
        const expDiv = document.createElement('div');
        expDiv.className = 'experience-item';
        
        const responsibilitiesList = exp.responsibilities.map(resp => 
            `<li>${resp}</li>`
        ).join('');
        
        expDiv.innerHTML = `
            <div class="job-title">${exp.title}</div>
            <div class="company">${exp.company}</div>
            <div class="date">${exp.date}</div>
            <ul>${responsibilitiesList}</ul>
        `;
        section.appendChild(expDiv);
    });
    
    return section;
}

// Network Animation
function initNetworkAnimation() {
    const canvas = document.getElementById('network-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const nodes = [];
    const connections = [];
    const nodeCount = 50;
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw nodes
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off edges
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
            
            // Keep in bounds
            node.x = Math.max(0, Math.min(canvas.width, node.x));
            node.y = Math.max(0, Math.min(canvas.height, node.y));
            
            // Draw node
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        });
        
        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - distance / 150)})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Handle profile image error
document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.getElementById('profile-img');
    if (profileImg) {
        profileImg.onerror = function() {
            // Create a placeholder if image is not found
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #ffffff, #cccccc);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
                font-weight: bold;
                font-size: 2em;
            `;
            placeholder.textContent = 'VR';
            this.parentElement.appendChild(placeholder);
        };
    }
    
    // Initialize network animation
    initNetworkAnimation();
    
    // Initialize terminal
    initTerminal();
});

